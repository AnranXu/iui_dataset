import {Container, Row, Col, ThemeProvider} from 'react-bootstrap';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Component } from 'react';
import React from 'react';
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
        this.state = {bboxs: [], anns: [], imageURL: '', labelURL: '', 
        imageWidth: 0, imageHeight: 0, manualBboxs: []};
        this.stageRef = React.createRef();
        this.imageRef = React.createRef();
        this.virtualRectRef = React.createRef();
        this.minBboxSize = 300;
    }
    loadImage = (url) =>{
        //load the image which has the lowest zIndex
        console.log('loading image');
        //send stageRef 

        return (
            <URLImage src={url}></URLImage>
        );
    }
    componentDidMount(){
        this.sendStage();
        this.setManualMode();
    }
    createDefaultBboxs = () => {
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
    createManualBboxs = () => {

        return this.state.manualBboxs.map((bbox, i)=>(
            <Rect
            x={parseInt(bbox['bbox'][0])}
            y={parseInt(bbox['bbox'][1])}
            width={parseInt(bbox['bbox'][2])}
            height={parseInt(bbox['bbox'][3])}
            fill= {"rgba(255,255,255,0)"}
            draggable= {true}
            shadowBlur={0}
            stroke = {'blue'}
            strokeWidth={3}
            id={'manualBbox-' + bbox['id']}
            key={'manualBbox-' + bbox['id']}
            name={'bbox'}> 
            </Rect>
        ))
    }
    sendStage = () =>{
        this.props.toolCallback({'stageRef': this.stageRef});
    }
    setManualMode = () => {
      var x1, y1, x2, y2;
      let selectorDownFunction = (e) => {
        if(!this.props.manualMode)
            return;
        // do nothing if we mousedown on any shape
        //console.log(canvas.stage.find('.canvas'));
        if (e.target !== this.imageRef.current) {
          return;
        }
        x1 = this.stageRef.current.getPointerPosition().x;
        y1 = this.stageRef.current.getPointerPosition().y;
        x2 = this.stageRef.current.getPointerPosition().x;
        y2 = this.stageRef.current.getPointerPosition().y;
        //console.log(x1,y1);
        this.virtualRectRef.current.visible(true);
        this.virtualRectRef.current.width(0);
        this.virtualRectRef.current.height(0);
        
      }

      let selectorMoveFunction = (e) => {
         // no nothing if we didn't start selection
        if(!this.props.manualMode)
          return;
        if (!this.virtualRectRef.current.visible()) {
          return;
        }
        x2 = this.stageRef.current.getPointerPosition().x;
        y2 = this.stageRef.current.getPointerPosition().y;

        this.virtualRectRef.current.setAttrs({
          x: Math.min(x1, x2),
          y: Math.min(y1, y2),
          width: Math.abs(x2 - x1),
          height: Math.abs(y2 - y1),
        });
      }

      let selectorUpFunction = (e) => {
         // no nothing if we didn't start selection
        if(!this.props.manualMode)
          return;
        if (!this.virtualRectRef.current.visible()) {
          return;
        }
        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
            this.virtualRectRef.current.visible(false);
        });
        var bboxs = this.state.manualBboxs;
        var x = this.virtualRectRef.current.attrs['x'];
        var y = this.virtualRectRef.current.attrs['y'];
        var w = this.virtualRectRef.current.attrs['width'];
        var h = this.virtualRectRef.current.attrs['height'];
        // if the bounding box is too small, we do not create it.
        if (w * h < this.minBboxSize)
        {
            this.props.toolCallback({addingBbox: false});
            return;
        }
        bboxs.push({'bbox': [x,y,w,h]});
        // add id from 0 to bboxs.length - 1 to each manual bounding box
        bboxs = bboxs.map((bbox,i)=> ({...bbox, 'id': i}));
        this.setState({manualBboxs: bboxs}, () => {this.props.toolCallback({manualBboxs: bboxs, addingBbox: true})});
      }
      this.stageRef.current.on('mousedown touchstart', selectorDownFunction);
      this.stageRef.current.on('mousemove touchmove', selectorMoveFunction);
      this.stageRef.current.on('mouseup touchend', selectorUpFunction);
    }
    render(){
        return (
            <div>
                <Stage width={window.innerWidth} height={window.innerHeight} ref={this.stageRef}>
                    <Layer>
                        <URLImage src={this.props.imageURL} setRef={this.imageRef}></URLImage>
                        {/*Add A virtual rectangle for creating bounding box */}
                        <Rect fill={'rgba(0,50,180,0.5)'} stroke = {'blue'} visible={false} key={'virtualRect'} ref={this.virtualRectRef}></Rect>
                        {/*This function maintains defualt bounding boxes*/}
                        {this.props.bboxs.length? this.createDefaultBboxs()
                        : 
                        <Rect></Rect>
                        }
                        {/*This function maintains manual bounding boxes*/}
                        {
                        this.state.manualBboxs.length? this.createManualBboxs()
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