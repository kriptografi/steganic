import React, { Component } from 'react'
import InsertForm from './InsertForm'
import RetrieveForm from './RetrieveForm'

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1>Insert Message</h1>
        <InsertForm />
        <hr/>
        <h1>Retrieve Message</h1>
        <RetrieveForm />
      </div>
    );
  }
}

export default App;
