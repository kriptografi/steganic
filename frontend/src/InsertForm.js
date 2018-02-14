import React, { Component } from 'react'

class InsertForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentImage: null,
      resultImage: null
    }

    this.onImageChange = this.onImageChange.bind(this)
    this.insertMessage = this.insertMessage.bind(this)
  }
  
  onImageChange(e) {
    if (this.imageFileInput.files && this.imageFileInput.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
          this.setState({
            currentImage: e.target.result
          })
      }.bind(this);

      reader.readAsDataURL(this.imageFileInput.files[0]);
    }
  }

  insertMessage() {
    let data = new FormData()
    data.append('plainFile', this.plainFileInput.files[0])
    data.append('image', this.imageFileInput.files[0])
    data.append('key', this.keyInput.value)
    data.append('outputType', this.outputTypeBmpInput.checked ? 'image.bmp' : 'image.png')

    fetch('/stego', {
      method: 'POST',
      body: data
    }).then((resp) => {
      return resp.blob()
    }).then(function (resp) {
      this.setState({
        resultImage: URL.createObjectURL(resp)
      })
    }.bind(this)).catch((error) => {
      console.log(error)
    })

  }

  render() {
    return (
      <div>
        <div>
          <label>Message</label>
          <input ref={(input) => { this.plainFileInput = input }} type="file" name="plainFile" />
        </div>
        <div>
          <label>Image</label>
          <input onChange={this.onImageChange} ref={(input) => { this.imageFileInput = input }} type="file" name="image" />
        </div>
        <div>
          <label>Key</label>
          <input ref={(input) => { this.keyInput = input }} type="text" name="key" />
        </div>
        <div>
          <label>Output Type</label>
          <input type="radio" name="outputType" ref={(input) => {this.outputTypeBmpInput = input}} value="image/bmp" /> bmp 
          <input type="radio" name="outputType" ref={(input) => {this.outputTypePngInput = input}} value="image/png" /> png
        </div>
        <div>
          <button onClick={this.insertMessage}>Insert Message</button>
        </div>
        <div>
          {
            function() {
              if (this.state.currentImage)
                return <img alt="plain" src={this.state.currentImage} />
            }.apply(this)
          }
        </div>
        <div>
          {
            function() {
              if (this.state.resultImage)
                return <img alt="result" src={this.state.resultImage} />
            }.apply(this)
          }
        </div>
      </div>
    );
  }
}

export default InsertForm;
