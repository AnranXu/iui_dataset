import { Component } from "react";
import Toolbar from "./toolbar";
import Canvas from "./canvas";
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
            deleteFlag: true,
            clearManualBbox: false
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
                            <button onClick= { () => this.props.toolCallback({page: 'intro'})}>Back to Introduction</button>
                            <Toolbar toolCallback = {this.toolCallback} stageRef={this.state.stageRef} trRef={this.state.trRef}
                            manualMode={this.state.manualMode} manualBboxs={this.state.manualBboxs} 
                            addingBbox = {this.state.addingBbox} workerId = {this.props.workerId}/>
                        </Col>
                        <Col xs={12} md={8}>
                            <Canvas toolCallback = {this.toolCallback} imageURL = {this.state.imageURL} 
                            bboxs = {this.state.bboxs} manualMode={this.state.manualMode} deleteFlag={this.state.deleteFlag}
                            clearManualBbox = {this.state.clearManualBbox}/>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default General;