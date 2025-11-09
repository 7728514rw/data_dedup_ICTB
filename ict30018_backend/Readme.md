# Data Deduplication in Machine Unlearning

This repository contains code for the ICT30018 Project B on evaluating data deduplication impacts in federated machine unlearning.

## Setup
- Python 3.12+
- Install dependencies: `pip install torch torchvision flower numpy matplotlib`
- For GPU: Ensure CUDA is set up.

## Files
- `setup_fed_env.py`: Basic federated learning setup with Flower.
- `dataset_prep.py`: Dataset loading and duplication injection for MNIST/CIFAR-10.
- `research_notes/unlearning_baselines.md`: Notes on unlearning methods.

## Running
- Run `python setup_fed_env.py` to test federated setup.
- Run `python dataset_prep.py` to prepare datasets.

License: MIT