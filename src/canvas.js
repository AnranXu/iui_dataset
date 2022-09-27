import {Container, Row, Col} from 'react-bootstrap';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Component } from 'react';
import React from 'react'
import './canvas.css';
// I use react-konva to realize the interaction with Images and annotations
import { Stage, Layer, Image, Rect} from 'react-konva';
import URLImage from './urlImage.js';
import s3_handler from "./library/s3uploader.js";
/*
Canvas serves as showing the samples for annotators.
When annotators load a new image, canvas will read existing annotations provided by other datasets.
They may use three ways to annotate the image:
1) Choosing all bounding boxes of a specific category through the menu; then, annotating them with privacy-oriented tags. 
2) Choosing a specific bounding box for adding tags it if annotator think only a part of existing annotations can be regard as "private".
3) Manually creating a bounding box for content that does not have bounding box. Then, adding privacy-oriented tags for the bounding box.

We also enable annotators to check how previous annotators provide their tags. 
*/
class Canvas extends Component{
    // The Canvas maintain a list of annotations and generate it into the canvas. 
	constructor(props)
	{
        super(props);
        this.state = {bboxs: [], anns: [], imageURL: '', labelURL: '', imageWidth: 0, imageHeight: 0};
        this.stageRef = React.createRef();
        this.imageRef = React.createRef();
    }
    load_image = (url) =>{
        //load the image which has the lowest zIndex
        console.log('loading image');
        //send stageRef 

        return (
            <URLImage src={url}></URLImage>
        );
    }
    componentDidMount(){
        this.sendStage();
    }
    create_bboxs = () => {
        console.log(this.props.bboxs);
        return this.props.bboxs.map((bbox, i)=>(
            <Rect
            x={parseInt(bbox['bbox'][0])}
            y={parseInt(bbox['bbox'][1])}
            width={parseInt(bbox['bbox'][2])}
            height={parseInt(bbox['bbox'][3])}
            fill= {"rgba(255,255,255,0)"}
            draggable= {true}
            shadowBlur={0}
            stroke = {'black'}
            strokeWidth={3}
            id={'bbox' + String(i) + '-' + String(bbox['category'])}
            key={'bbox' + String(i) + '-' + String(bbox['category'])}
            name={'bbox'}
            />
        ));
    }
    sendStage = () =>{
        this.props.toolCallback({'stageRef': this.stageRef});
    }
    render(){
        return (
            <div>
                <Stage width={window.innerWidth} height={window.innerHeight} ref={this.stageRef}>
                    <Layer>
                        <URLImage src={this.props.imageURL} ref={this.imageRef}></URLImage>
                        {/*This function maintains bounding boxes*/}
                        {this.props.bboxs.length? this.create_bboxs()
                        : 
                        <Rect></Rect>
                        }
                    </Layer>
                </Stage>
            </div>
        );
    }
}

export default Canvas;