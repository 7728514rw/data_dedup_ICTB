import flwr as fl
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np

# Define a simple CNN model
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3)
        self.fc1 = nn.Linear(1600, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = torch.max_pool2d(x, 2)
        x = torch.flatten(x, 1)
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return torch.log_softmax(x, dim=1)

# Client function
def client_fn(cid: str):
    # Load data (simple partition for demo)
    transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
    trainset = datasets.MNIST("./data", download=True, train=True, transform=transform)
    num_samples = len(trainset) // 3  # Simulate 3 clients
    client_data = torch.utils.data.Subset(trainset, range(int(cid) * num_samples, (int(cid) + 1) * num_samples))
    trainloader = DataLoader(client_data, batch_size=32, shuffle=True)

    model = SimpleCNN()
    optimizer = optim.SGD(model.parameters(), lr=0.01)
    
    def train(num_epochs):
        model.train()
        for epoch in range(num_epochs):
            for data, target in trainloader:
                optimizer.zero_grad()
                output = model(data)
                loss = nn.functional.nll_loss(output, target)
                loss.backward()
                optimizer.step()
        return model.state_dict(), len(client_data)

    def evaluate():
        testset = datasets.MNIST("./data", download=True, train=False, transform=transform)
        testloader = DataLoader(testset, batch_size=32)
        model.eval()
        test_loss = 0
        correct = 0
        with torch.no_grad():
            for data, target in testloader:
                output = model(data)
                test_loss += nn.functional.nll_loss(output, target, reduction="sum").item()
                pred = output.argmax(dim=1, keepdim=True)
                correct += pred.eq(target.view_as(pred)).sum().item()
        test_loss /= len(testloader.dataset)
        return test_loss, correct / len(testloader.dataset)

    return fl.client.NumPyClient(
        get_parameters=lambda: [val.cpu().numpy() for _, val in model.state_dict().items()],
        set_parameters=lambda parameters: model.load_state_dict({k: torch.tensor(v) for k, v in zip(model.state_dict(), parameters)}),
        fit=lambda parameters, config: (train(1), len(client_data), {}),  # 1 epoch per round
        evaluate=lambda parameters, config: (0.0, len(testset), {"accuracy": evaluate()[1]})
    )

# Start simulation
fl.simulation.start_simulation(
    client_fn=client_fn,
    num_clients=3,
    client_resources={"num_cpus": 1},
    config=fl.server.ServerConfig(num_rounds=3)
)

print("Federated learning simulation completed.")