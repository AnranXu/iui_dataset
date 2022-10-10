import os
import json
import argparse
import numpy as np
import csv
class analyzer:
    def __init__(self, platform) -> None:
        self.platform = platform
        self.task_record_path = platform + '/' + 'task_record.json'
        self.label_folder = platform + '/' + 'crowdscouringlabel/'
        self.mycat = {'OpenImages': {}, 'LVIS': {}, 'all': {}}
        self.default_category = {'OpenImages': {}, 'LVIS': {}}
        self.manual_category = {'OpenImages': {}, 'LVIS': {}}
        self.privacy_count_by_image = {'OpenImages': 0, 'LVIS': 0}
        self.nonprivacy_count_by_image = {'OpenImages': 0, 'LVIS': 0}
        self.privacy_count_by_label = {'OpenImages': 0, 'LVIS': 0}
        self.nonprivacy_count_by_label = {'OpenImages': 0, 'LVIS': 0}
        self.code_openimage_map = {}
        self.openimages_mycat_map = {}
        self.lvis_mycat_map = {}
        with open(self.task_record_path, encoding='utf-8') as f:
            text = f.read()
            self.task_record = json.loads(text)
        
    def basic_count(self) -> None:
        labels = os.listdir(self.label_folder)
        manual_num = 0
        for label in labels:
            with open(self.label_folder + label, encoding='utf-8') as f:
                text = f.read()
                record = json.loads(text)
                ifPrivacy = False
                source  = record['source']
                if source not in ['OpenImages', 'LVIS']:
                    continue
                for key, value in record['defaultAnnotation'].items():
                    if key not in self.default_category[source].keys():
                        self.default_category[source][key] = {'reason': np.zeros(5), 'importance': np.zeros(7), 'sharing': np.zeros(5), 
                        'reasonInput': [], 'sharingInput': [], 'notPrivacy': 0, 'privacy': 0, 'num': 0}
                    self.default_category[source][key]['num'] += 1
                    if record['defaultAnnotation'][key]['ifNoPrivacy']:
                        self.default_category[source][key]['notPrivacy'] += 1
                        self.nonprivacy_count_by_label[source] += 1
                        continue
                    self.privacy_count_by_label[source] += 1
                    self.default_category[source][key]['privacy'] += 1
                    ifPrivacy = True
                    #reason
                    reason_value = int(record['defaultAnnotation'][key]['reason']) - 1
                    self.default_category[source][key]['reason'][reason_value] += 1
                    # if other reasons
                    if reason_value == 4:
                        self.default_category[source][key]['reasonInput'].append(record['defaultAnnotation'][key]['reasonInput'])
                    # importance
                    importance_value = int(record['defaultAnnotation'][key]['importance']) - 1
                    self.default_category[source][key]['importance'][importance_value] += 1
                    # sharing
                    sharing_value = int(record['defaultAnnotation'][key]['sharing']) - 1
                    self.default_category[source][key]['reason'][sharing_value] += 1
                    # if other sharing
                    if sharing_value == 4:
                        self.default_category[source][key]['sharingInput'].append(record['defaultAnnotation'][key]['sharingInput'])

                for key, value in record['manualAnnotation'].items():
                    category = record['manualAnnotation'][key]['category']
                    if category not in self.manual_category[source].keys():
                        self.manual_category[source][category] = {'num': 0, 'reason': np.zeros(5), 'importance': np.zeros(7), 'sharing': np.zeros(5), 
                        'reasonInput': [], 'sharingInput': []}
                    #num += 1
                    self.privacy_count_by_label[source] += 1
                    ifPrivacy = True
                    self.manual_category[source][category]['num'] += 1
                    #reason
                    reason_value = int(record['manualAnnotation'][key]['reason']) - 1
                    self.manual_category[source][category]['reason'][reason_value] += 1
                    # if other reasons
                    if reason_value == 4:
                        self.manual_category[source][category]['reasonInput'].append(record['manualAnnotation'][key]['reasonInput'])
                    # importance
                    importance_value = int(record['manualAnnotation'][key]['importance']) - 1
                    self.manual_category[source][category]['importance'][importance_value] += 1
                    # sharing
                    sharing_value = int(record['manualAnnotation'][key]['sharing']) - 1
                    self.manual_category[source][category]['reason'][sharing_value] += 1
                    # if other sharing
                    if sharing_value == 4:
                        self.manual_category[source][category]['sharingInput'].append(record['manualAnnotation'][key]['sharingInput'])
                if ifPrivacy:
                    self.privacy_count_by_image[source] += 1
                else:
                    self.nonprivacy_count_by_image[source] += 1

    #check unfinished task and generate a new task_record.json for only unfinished tasks
    def integrity_check(self, select_bar)->None:
        record_path = os.path.join(self.platform, 'task_record.json')
        new_record = {'cur_progress': '0', 'worker_record': {}}
        cur_step = '0'
        with open(record_path, encoding='utf-8') as f:
            text = f.read()
            record = json.loads(text)
            list_len = record['list_len']
            for i in range(list_len):
                worker_record = record[str(i)]
                if worker_record['workerprogress'] <= select_bar:
                    worker_record['workerid'] = ''
                    worker_record['workerprogress'] = 0
                    new_record[cur_step] = worker_record
                    cur_step = str(int(cur_step) + 1)
            
            if cur_step != '0':
                new_record['list_len'] = int(cur_step)
                with open('task_record.json', 'w') as w:
                    w.write(str(new_record))


    def check_labels_by_mycat(self)->None:

        # for OpenImages 
        with open('../dataset/OpenImages/csv/oidv6-class-descriptions.csv') as f:
            res = csv.reader(f)
            for row in res:
                self.code_openimage_map[row[0]] = row[1]
            
        with open('../dataset/OpenImages/mycat_openimages_map.csv') as f:
            res = csv.reader(f)
            flag = 0
            for row in res:
                if not flag:
                    flag = 1
                    continue
                openimages_cats = row[1].split('|')
                if 'None' in row[1]:
                    continue
                for cat in openimages_cats:
                    category_name = self.code_openimage_map[cat]
                    self.openimages_mycat_map[category_name] = row[0]
        self.openimages_mycat_map['Human eye'] = 'Person'
        self.openimages_mycat_map['Human beard'] = 'Person'
        self.openimages_mycat_map['Human mouth'] = 'Person'
        self.openimages_mycat_map['Human foot'] = 'Person'
        self.openimages_mycat_map['Human leg'] = 'Person'
        self.openimages_mycat_map['Human ear'] = 'Person'
        self.openimages_mycat_map['Human hair'] = 'Person'
        self.openimages_mycat_map['Human head'] = 'Person'
        self.openimages_mycat_map['Human face'] = 'Person'
        self.openimages_mycat_map['Human arm'] = 'Person'
        self.openimages_mycat_map['Human nose'] = 'Person'
        self.openimages_mycat_map['Human hand'] = 'Person'
        self.openimages_mycat_map['Human body'] = 'Person'
        self.openimages_mycat_map['Man'] = 'Person'
        self.openimages_mycat_map['Woman'] = 'Person'
        self.openimages_mycat_map['Boy'] = 'Person'
        self.openimages_mycat_map['Girl'] = 'Person'
        with open('../dataset/LVIS/mycat_lvis_map.csv') as f:
            res = csv.reader(f)
            flag = 0
            for row in res:
                if not flag:
                    flag = 1
                    continue
                lvis_cats = row[1].split('|')
                if 'None' in row[1]:
                    continue
                for cat in lvis_cats:
                    self.lvis_mycat_map[cat] = row[0]
        not_privacy = {'OpenImages': 0, 'LVIS': 0, 'all': 0}
        privacy = {'OpenImages': 0, 'LVIS': 0, 'all': 0}
        for dataset_name, dataset_value in self.default_category.items():
            for key, value in self.default_category[dataset_name].items():
                mycat = ''
                if dataset_name == 'OpenImages':
                    if key in self.openimages_mycat_map.keys():
                        mycat = self.openimages_mycat_map[key]
                elif dataset_name == 'LVIS':
                    if key in self.lvis_mycat_map.keys():
                        mycat = self.lvis_mycat_map[key]
                
                if mycat != '':
                    if mycat not in self.mycat[dataset_name].keys():
                        self.mycat[dataset_name][mycat] = {'reason': np.zeros(5), 'importance': np.zeros(7), 'sharing': np.zeros(5), 
                        'reasonInput': [], 'sharingInput': [], 'notPrivacy': 0, 'privacy': 0, 'num': 0}
                    if mycat not in self.mycat['all'].keys():
                        self.mycat['all'][mycat] = {'reason': np.zeros(5), 'importance': np.zeros(7), 'sharing': np.zeros(5), 
                        'reasonInput': [], 'sharingInput': [], 'notPrivacy': 0, 'privacy': 0, 'num': 0}
                    self.mycat[dataset_name][mycat]['reason'] += value['reason']
                    self.mycat[dataset_name][mycat]['importance'] += value['importance']
                    self.mycat[dataset_name][mycat]['sharing'] += value['sharing']
                    self.mycat[dataset_name][mycat]['reasonInput'].extend(value['reasonInput'])
                    self.mycat[dataset_name][mycat]['sharingInput'].extend(value['sharingInput'])
                    self.mycat[dataset_name][mycat]['notPrivacy'] += value['notPrivacy']
                    self.mycat[dataset_name][mycat]['privacy'] += value['privacy']
                    self.mycat[dataset_name][mycat]['num'] += value['num']

                    self.mycat['all'][mycat]['reason'] += value['reason']
                    self.mycat['all'][mycat]['importance'] += value['importance']
                    self.mycat['all'][mycat]['sharing'] += value['sharing']
                    self.mycat['all'][mycat]['reasonInput'].extend(value['reasonInput'])
                    self.mycat['all'][mycat]['sharingInput'].extend(value['sharingInput'])
                    self.mycat['all'][mycat]['notPrivacy'] += value['notPrivacy']
                    self.mycat['all'][mycat]['privacy'] += value['privacy']
                    self.mycat['all'][mycat]['num'] += value['num']
                    privacy[dataset_name] += value['privacy']
                    privacy['all'] += value['privacy']
                    not_privacy[dataset_name] += value['notPrivacy']
                    not_privacy['all'] += value['notPrivacy']
        sorted_category = dict(sorted(self.mycat['OpenImages'].items(),\
        key=lambda item: float(item[1]['privacy'])/float(item[1]['num']), reverse=True))
        print(sorted_category.keys())
        print(privacy)
        print(not_privacy)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--platform', type=str, default='CrowdWorks')
    opt = parser.parse_args()
    platform_name = opt.platform
    analyze = analyzer(platform_name)
    analyze.basic_count()
    source = 'OpenImages'
    #print(analyze.default_category[source].keys())
    #print(analyze.manual_category[source].keys())
    sorted_category = dict(sorted(analyze.default_category[source].items(),\
        key=lambda item: float(item[1]['privacy'])/float(item[1]['num']), reverse=True))
    print([ [key, value['privacy']]for key, value in sorted_category.items() if value['num'] >= 5])
    
    analyze.check_labels_by_mycat()
    print('privacy count by label: ', analyze.privacy_count_by_label)
    print('nonprivacy count by label: ', analyze.nonprivacy_count_by_label)
    analyze.integrity_check(select_bar=0)