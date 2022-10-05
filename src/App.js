import './App.css';
import General from './general.js';
import Intro from './intro.js';
import { Component } from "react";

class App extends Component {
  constructor(props)
  {
    super(props);
    document.title = "privacy-oriented annotation";
    this.state = {page: 'intro', workerId: ''};
  }
  toolCallback = (childData) =>{
    console.log(childData);
    this.setState(childData);
}
  render(){
    return (
      <div className="App">
        {
          this.state.page === 'intro'? <Intro toolCallback={this.toolCallback}/>:
          <General workerId = {this.state.workerId} toolCallback={this.toolCallback}/>
        }
        
      </div>
    );
  }
}

export default App;
