import os
import json
import argparse
import numpy as np

class analyzer:
    def __init__(self, platform) -> None:
        self.platform = platform
        self.task_record_path = platform + '/' + 'task_record.json'
        self.label_folder = platform + '/' + 'crowdscouringlabel/'
        self.default_category = {'OpenImages': {}, 'LVIS': {}}
        self.manual_category = {'OpenImages': {}, 'LVIS': {}}
        self.privacy_count = {'OpenImages': 0, 'LVIS': 0}
        self.nonprivacy_count = {'OpenImages': 0, 'LVIS': 0}
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
                        continue
                    
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
                    self.privacy_count[source] += 1
                else:
                    self.nonprivacy_count[source] += 1

    #check unfinished task and generate a new task_record.json for only unfinished tasks
    def integrity_check(self)->None:
        pass

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--platform', type=str, default='CrowdWorks')
    opt = parser.parse_args()
    platform_name = opt.platform
    analyze = analyzer(platform_name)
    analyze.basic_count()
    source = 'OpenImages'
    print(analyze.default_category[source].keys())
    print(analyze.manual_category[source].keys())
    sorted_category = dict(sorted(analyze.default_category[source].items(),\
        key=lambda item: float(item[1]['privacy'])/float(item[1]['num']), reverse=True))
    print([ [key, value['privacy']/value['num']]for key, value in sorted_category.items()])
    print('privacy count: ', analyze.privacy_count)
    print('nonprivacy count: ', analyze.nonprivacy_count)