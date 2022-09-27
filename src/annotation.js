import { Component } from "react";
import './annotation.css';

class AnnotationCard extends Component{
    constructor(props){
        super(props);
        this.state = {mainStyle: {position: 'relative', display: 'none'}};
    }
    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.visibleCat !== prevProps.visibleCat && this.props.visibleCat === this.props.id) {
            // show if click
            console.log('get in: ', this.props.visibleCat);
            this.setState({mainStyle: {position: 'relative', display: 'block'}});
        }
        else if(this.props.visibleCat !== prevProps.visibleCat && this.props.visibleCat !== this.props.id){
            // hide if not click
            this.setState({mainStyle: {position: 'relative', display: 'none'}})
        }
      }
    render(){
        return(
            <div style={this.state.mainStyle}>
                {'test'}
            </div>
        );
    }
}

export default AnnotationCard;