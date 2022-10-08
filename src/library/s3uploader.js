import $ from "jquery";
import AWS from 'aws-sdk';

class s3_handler{
    constructor(language, testMode)
    {
        this.s3 = this.s3_init();
        this.language = language;
        this.testMode = testMode;
        this.bucketName = 'iui-privacy-dataset';
        this.platform = {'en': 'Prolific/',
        'jp': 'CrowdWorks/'};
        //var len = 0;
    }
    s3_init() {
        AWS.config.region = 'ap-northeast-1'; 
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'ap-northeast-1:82459228-da79-4229-aeef-0168565a5e2e',
        });
        AWS.config.apiVersions = {
        cognitoidentity: '2014-06-30',
        // other service API versions
        };
        var s3 = new AWS.S3({
            params: {Bucket: this.bucketName}
        });
        //const key = 'whole_.png';
        //var URIKey= encodeURIComponent(key);
        return s3;
    }     
    updateRecord = (task_record) => {
        var res = JSON.stringify(task_record);
        var name = '';
        if(this.testMode)
            name = 'testMode/' + 'task_record.json';
        else
            name = this.platform[this.language] + 'task_record.json';
        console.log(name);
        var textBlob = new Blob([res], {
            type: 'text/plain'
        });
        this.s3.upload({
            Bucket: this.bucketName,
            Key: name,
            Body: textBlob,
            ContentType: 'text/plain',
            ACL: 'bucket-owner-full-control'
        });
    }   
    updateAnns = (image_id, worker_id, anns) => {
        var res = JSON.stringify(anns);
        var name = '';
        if(this.testMode)
            name = 'testMode/' + 'crowdscouringlabel/'+ image_id + '_' + worker_id + '_label.json';
        else
            name = this.platform[this.language] + 'crowdscouringlabel/'+ image_id + '_' + worker_id + '_label.json';
        var textBlob = new Blob([res], {
            type: 'text/plain'
        });
        this.s3.upload({
            Bucket: this.bucketName,
            Key: name,
            Body: textBlob,
            ContentType: 'text/plain',
            ACL: 'bucket-owner-full-control'
        }, function(err, data) {
            if(err) {
                console.log(err);
            }
            }).on('httpUploadProgress', function (progress) {
            var uploaded = parseInt((progress.loaded * 100) / progress.total);
            $("progress").attr('value', uploaded);
        });
    }   
    updateQuestionnaire = (anws, workerId)=>{
        var res = JSON.stringify(anws);
        var name = '';
        if(this.testMode)
            name = 'testMode/' + 'workerInfo/'+ workerId + '.json';
        else
            name = this.platform[this.language] + 'workerInfo/'+ workerId + '.json';
        var textBlob = new Blob([res], {
            type: 'text/plain'
        });
        this.s3.upload({
            Bucket: this.bucketName,
            Key: name,
            Body: textBlob,
            ContentType: 'text/plain',
            ACL: 'bucket-owner-full-control'
        }, function(err, data) {
            if(err) {
                console.log(err);
            }
            }).on('httpUploadProgress', function (progress) {
            var uploaded = parseInt((progress.loaded * 100) / progress.total);
            $("progress").attr('value', uploaded);
        });
    }
}
     

export default s3_handler;