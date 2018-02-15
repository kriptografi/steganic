import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
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
                <Link className="nav-link" to="/insert">Insert</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/retrieve">Retrieve</Link>
              </li>
            </ul>
          </div>
          <div className="col" />
          
        </div>

        <div className="row" style={{marginTop: 50}}>
          <div className="col" />
          <div className="col-8">
            <Route exact path='/' component={InsertForm} />
            <Route exact path='/insert' component={InsertForm} />
            <Route exact path='/retrieve' component={RetrieveForm} />
          </div>
          <div className="col" />
        </div>

      </div>
    );
  }
}

export default App;
