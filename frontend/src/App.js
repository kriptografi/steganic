import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import InsertForm from './InsertForm'
import RetrieveForm from './RetrieveForm'

class App extends Component {
  render() {
    return (
      <div>
        <div className="container center grey darken-2" style={{padding:10}}>
          <Link className="waves-effect waves-light btn-flat grey white-text" style={{marginRight:3}}to="/insert">Insert</Link>
          <Link className="waves-effect waves-light btn-flat grey white-text" to="/retrieve">Retrieve</Link>
        </div>

        <div class="container grey lighten-5">
          <br/>
          <br/>
          <div class="row">
            <Route exact path='/' component={InsertForm} />
            <Route exact path='/insert' component={InsertForm} />
            <Route exact path='/retrieve' component={RetrieveForm} />
          </div>
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
