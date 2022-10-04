import { Component } from "react";
import Toolbar from "./toolbar";
import Canvas from "./canvas";
import './general.css';
import {Container, Row, Col} from 'react-bootstrap';
import { IoTJobsDataPlane } from "aws-sdk";

class General extends Component{
	constructor(props)
	{
        super(props);
        this.state = {
            toolData: 'unsend',
            imageURL: '',
            bboxs: [],
            stageRef: null,
            trRef: null,
            manualMode: false,
            manualBboxs: [],
            addingBbox: false,
            deleteFlag: true
        }
    }
    toolCallback = (childData) =>{
        console.log(childData);
        this.setState(childData);
    }
    render(){
        return (
            <div>
                <Container>
					<Row>
                        <Col xs={12} md={4}>
                            <Toolbar toolCallback = {this.toolCallback} stageRef={this.state.stageRef} trRef={this.state.trRef}
                            manualMode={this.state.manualMode} manualBboxs={this.state.manualBboxs} addingBbox = {this.state.addingBbox}/>
                            {this.state.toolData}
                        </Col>
                        <Col xs={12} md={8}>
                            <Canvas toolCallback = {this.toolCallback} imageURL = {this.state.imageURL} 
                            bboxs = {this.state.bboxs} manualMode={this.state.manualMode} deleteFlag={this.state.deleteFlag}/>
                        </Col>
                    </Row>
                </Container>
                
                
            </div>
        );
    }
}

export default General;