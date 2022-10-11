import os

if __name__ == '__main__':
    root = './federated_dataset/all_img'
    imgs = os.listdir(root)
    with open('./img_list', 'w') as f:
        for i, img in enumerate(imgs):
            if i != len(imgs) - 1:
                f.write(img[:-4] + '\n')
            else:
                f.write(img[:-4])