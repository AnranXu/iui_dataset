import fiftyone as fo
import fiftyone.zoo as foz

if __name__ == '__main__':
	dataset = foz.load_zoo_dataset(
    "open-images-v6",
    split="validation",
    max_samples=100,
    seed=51,
    shuffle=True,
	)
	session = fo.launch_app()