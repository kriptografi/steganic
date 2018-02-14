import React, { Component } from 'react'
import InsertForm from './InsertForm'
import RetrieveForm from './RetrieveForm'

class App extends Component {
  render() {
    return (
      <div className="container" style={{marginTop: 20}}>
        <div className="row">
          <div className="col" />
          <div className="col-8">
            <ul className="nav nav-pills nav-fill">
              <li className="nav-item">
                <a className="nav-link active" href="#">Insert</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Retrieve</a>
              </li>
            </ul>
          </div>
          <div className="col" />
          
        </div>
        <div className="row" style={{marginTop: 50}}>
          <div className="col" />
          <div className="col-8">
            <legend>Insert Message</legend>
            <InsertForm />
            <hr/>
            <h1>Retrieve Message</h1>
            <RetrieveForm />
          </div>
          <div className="col" />
        </div>
      </div>
    );
  }
}

export default App;
