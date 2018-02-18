import React, { Component } from 'react'
import 'noty/lib/noty.css'
import 'noty/lib/themes/nest.css'
import Noty from 'noty'
import Image from './Image'

class InsertForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentImage: null,
      resultImage: null,
      currentImageFilename: null,
      resultImageFilename: null
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
      this.setState({currentImageFilename: this.imageFileInput.files[0].name})
      reader.readAsDataURL(this.imageFileInput.files[0]);
    }
  }

  insertMessage() {
    let data = new FormData()
    data.append('plainFile', this.plainFileInput.files[0])
    data.append('image', this.imageFileInput.files[0])
    data.append('key', this.keyInput.value)
    data.append('threshold', this.thresholdInput.value)
    data.append('outputType', this.outputTypeInput.value)
    data.append('usingCgc', this.usingCgcInput.checked ? true : false)

    fetch('/stego/insert', {
      method: 'POST',
      body: data
    }).then((resp) => {
      if (resp.status === 200)
        return resp.blob()
      return Promise.reject(resp.error)
    }).then(function (resp) {
      let filename = this.state.currentImageFilename.split(".").slice(0,-1).join(".") + "-stego"

      this.setState({
        resultImage: URL.createObjectURL(resp),
        resultImageFilename: filename
      })

      new Noty({
        text: 'Message Inserted',
        type: 'success',
        theme: 'nest',
      }).show()
    }.bind(this)).catch((error) => {
      console.log(error)
      new Noty({
        text: (error || 'Cannot insert image'),
        type: 'error',
        theme: 'nest',
      }).show()
    })

  }

  render() {
    return (
      <div>

        <div>
          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Message</label>
            <div className="col-sm-10">
              <input ref={(input) => { this.plainFileInput = input }} type="file" className="form-control-plaintext" />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Image</label>
            <div className="col-sm-10">
              <input onChange={this.onImageChange} ref={(input) => { this.imageFileInput = input }} type="file" className="form-control-plaintext" />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Key</label>
            <div className="col-sm-10">
              <input ref={(input) => { this.keyInput = input }} type="text" className="form-control" />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Threshold</label>
            <div className="col-sm-10">
              <input ref={(input) => { this.thresholdInput = input }} type="text" className="form-control" defaultValue="0.7" />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Output Type</label>
            <div className="col-sm-10">
              <select ref={(input) => { this.outputTypeInput = input }} className="form-control">
                <option value="image/png">PNG</option>
                <option value="image/bmp">BMP</option>
              </select>
            </div>
          </div>

          <div className="form-group row">
            <div className="col-sm-2" />
            <div className="col-sm-10">
              <div className="form-check">
                <label className="form-check-label">
                  <input ref={(input) => {this.usingCgcInput = input}} className="form-check-input" type="checkbox" /> Use CGC System
                </label>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <div className="col-sm-2" />
            <div className="col-sm-10">
              <button onClick={this.insertMessage} className="btn btn-primary">Insert</button>
            </div>
          </div>

        </div>

        <div className="row">
            <div className="col-sm-6">
                <Image
                  filename={this.state.currentImageFilename}
                  alt="plain-image"
                  src={this.state.currentImage}
                  align="center" 
                  width="100%"
                  height="100%" />
            </div>
            <div className="col-sm-6">
                <Image
                  filename={this.state.resultImageFilename}
                  alt="messaged-image"
                  src={this.state.resultImage}
                  align="center"
                  width="100%"
                  height="100%" />
            </div>
        </div>
        
      </div>
    );
  }
}

export default InsertForm;
