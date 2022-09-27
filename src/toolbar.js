import { Component } from "react";
//s3 uploader to our Amazon S3 storage for saving images. 
//I am not familar with uploading data to our own backend server by using secure ways (I only know ways like jQuery).
//Currently, I am not planning to deploy some backend intelligent cut properties so we do not need backend computations. 
//Also, always setting a server in Google/Amazon will cost us much money. So, I prefer using Amazon S3 to deploy our backend data transfer. 
import s3_handler from "./library/s3uploader.js";
import {Container, Row, Col, Card, ListGroup} from 'react-bootstrap';
import AnnotationCard from './annotation.js';
class Toolbar extends Component{
	constructor(props)
	{
        super(props);
        this.state = {'callbackData': 'sent', bboxs: [], labelList: [], curCat: ''};
        this.cnt = 0;
    }
    sendData = () =>{
        this.props.toolCallback({'toolData': this.state.callbackData});
    }
    fetchImage = () =>{
        // get url of image and label from amazon s3. Still on working.
        var s3 = new s3_handler();
        s3.s3_test();
    }
    load_data = () =>{
        /*Maintaining the list of bounding boxes from original dataset and annotators
        The url links to the file that contains all the existing bounding boxes 
        Each line of the file is one annotation
        One annotation has 'bbox': 'category': for generating bounding boxes and getting category
        */
        var ret = {};
        //for testing image change,
        if(this.cnt == 0){
            ret = {imageURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/21879.jpg',
            labelURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/21879_label'};
            this.cnt += 1;
        }
        else{
            ret = {imageURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/20571.jpg',
            labelURL: 'https://iui-privacy-dataset.s3.ap-northeast-1.amazonaws.com/20571_label'};
        }
        var ori_bboxs = [];
        var label_list = {};
        fetch(ret.labelURL).then( (res) => res.text() ) //read label as text
        .then( (text) => {
            var ori_anns = text.split('\n'); // split it as each row has one annotation
            for(var i = 0; i < ori_anns.length; i++)
            {
                var json = ori_anns[i].replaceAll("\'", "\"");
                var cur_ann = JSON.parse(json); // parse each row as json file
                ori_bboxs.push({'bbox': cur_ann['bbox'], 'category': cur_ann['category'], 
                'width': cur_ann['width'], 'height': cur_ann['height']}); //get bbox (x, y, w, h), width, height of the image (for unknown reasons, the scale of bboxs and real image sometimes are not identical), and category
                //create list of category, we just need to know that this image contain those categories.
                console.log(cur_ann['category']);
                label_list[cur_ann['category']] = 1;
            }
            ret.bboxs = ori_bboxs;
            this.setState({bboxs: ori_bboxs, labelList: Object.keys(label_list)});
        }
        ).then(() => {this.props.toolCallback(ret)})
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    create_label_list = () => {
        
        //list label according to the category
        return this.state.labelList.map((label,i)=>(
        <div>
        <ListGroup.Item action key={label} id={label} onClick={this.choose_label}>
            {label}
        </ListGroup.Item>
        <AnnotationCard visibleCat={this.state.curCat} id = {label}></AnnotationCard>
        </div>
        ));
    }
    choose_label = (e)=>{
        //if stageRef is not null, choose bboxs by pairing label and id of bbox
        //bbox'id: 'bbox' + String(i) + '-' + String(bbox['category'])
        //e.target.key is the category
        if(this.props.stageRef){
            //find all bounding boxes
            var bboxs = this.props.stageRef.current.find('.bbox');
            for(var i = 0; i < bboxs.length; i++)
            {
                //highlight qualified bounding boxes (not finished)
                if(bboxs[i].attrs['id'].split('-')[1] == e.target.id)
                {
                    bboxs[i].attrs['stroke'] = 'red';
                }
                else{
                    bboxs[i].attrs['stroke'] = 'black';
                }
            }
            this.props.stageRef.current.getLayers()[0].batchDraw();
            this.setState({curCat: e.target.id});
        }
    }
    render(){
        return (
            <div>
                <button onClick = {() => this.sendData()}>Test sending URL</button>
                <button onClick = {this.fetchImage}>Test S3</button>
                <button onClick = {(e)=>{this.load_data()}}>Test Loading</button>
                {/* Menu for choosing all bounding boxes from a specific category */}
                <div>
                Label List
                <Card style={{left: '3rem', width: '20rem' }}>
                    {
                        this.state.labelList.length? 
                        <ListGroup variant="flush">
                        {this.create_label_list()}
                        </ListGroup>
                        :
                        <div></div>
                    }
                </Card>
                </div>
            </div>
        );
    }
}

export default Toolbar;