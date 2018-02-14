import React, { Component } from 'react'

class RetrieveForm extends Component {

  render() {
    return (
      <div>
        <div>
          <label>Image</label>
          <input type="file" name="image" />
        </div>
        <div>
          <label>Key</label>
          <input type="text" name="key" />
        </div>
        <div>
          <button onClick={this.insertMessage}>Retrieve Message</button>
        </div>
      </div>
    );
  }
}

export default RetrieveForm;
