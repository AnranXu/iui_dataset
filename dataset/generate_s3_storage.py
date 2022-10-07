#this code generate a json file that store each worker‘s task and progress
#in the interface, we use amazon s3 download and upload to maintain the progress and assign task to each worker
import os
import numpy as np
import math

if __name__ == '__main__':
    #read all images and labels
    IMG_ROOT = './federated_dataset/all_img'
    img_list = os.listdir(IMG_ROOT)
    # shuffle the data first
    np.random.seed(0)
    np.random.shuffle(img_list)
    print(img_list)
    # we assign 10 annotation tasks to each worker
    task_per_worker = 10
    # cur_progress: the next task num that should be assign to a new worker
    task_record = {'cur_progess': '0', 'worker_record': {}}
    for i in range(math.ceil(len(img_list) / task_per_worker)):
        task_record[str(i)] = {'workerid': '', 'workerprogress': 0, 'list_len': math.ceil(len(img_list) / task_per_worker), 'img_list': []}
        for j in range(task_per_worker):
            # we delete the .jpg postfix because the interface should also find its label
            if task_per_worker*i+j < len(img_list):
                task_record[str(i)]['img_list'].append(img_list[task_per_worker*i+j][:-4])
    with open('task_record.json', 'w') as f:
        f.write(str(task_record))


