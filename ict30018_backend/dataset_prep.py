import torch
from torchvision import datasets, transforms
import numpy as np
import matplotlib.pyplot as plt

def load_dataset(name="MNIST"):
    transform = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))]) if name == "MNIST" else transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])
    trainset = datasets.MNIST("./data", download=True, train=True, transform=transform) if name == "MNIST" else datasets.CIFAR10("./data", download=True, train=True, transform=transform)
    return trainset

def create_non_iid_partitions(dataset, num_clients=3, alpha=0.5):
    # Dirichlet distribution for non-IID
    labels = np.array(dataset.targets)
    num_classes = len(np.unique(labels))
    client_indices = [[] for _ in range(num_clients)]
    for label in range(num_classes):
        indices = np.where(labels == label)[0]
        np.random.shuffle(indices)
        proportions = np.random.dirichlet(np.repeat(alpha, num_clients))
        splits = (proportions * len(indices)).astype(int)
        splits[-1] = len(indices) - sum(splits[:-1])  # Adjust last
        start = 0
        for i in range(num_clients):
            client_indices[i].extend(indices[start:start + splits[i]])
            start += splits[i]
    return [torch.utils.data.Subset(dataset, indices) for indices in client_indices]

def inject_duplications(client_data, duplication_rate=0.15):
    # Randomly duplicate samples
    num_duplicates = int(len(client_data) * duplication_rate)
    duplicate_indices = np.random.choice(len(client_data), num_duplicates, replace=True)
    duplicated_data = torch.utils.data.ConcatDataset([client_data, torch.utils.data.Subset(client_data, duplicate_indices)])
    return duplicated_data

# Example usage
dataset = load_dataset("MNIST")
partitions = create_non_iid_partitions(dataset, num_clients=3)
duplicated_partition_0 = inject_duplications(partitions[0])

# Visualize sample
img, label = duplicated_partition_0[0]
plt.imshow(img.squeeze(), cmap="gray")
plt.title(f"Label: {label}")
plt.show()

print(f"Original partition size: {len(partitions[0])}, Duplicated size: {len(duplicated_partition_0)}")