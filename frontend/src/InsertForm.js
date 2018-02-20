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
    data.append('usingEncrption', this.usingEncyrptionInput ? true : false)
    data.append('usingRandom', this.usingRandomInput ? true : false)

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
        
        {/* Form section */}
        <div className="col s12 m8">
          <div className="row">
            <div className="col s2 m2 offset-m1">
              <br/><b>Message</b>
            </div>
            <div className="col s10 m8 input-field">
              <input ref={(input) => { this.plainFileInput = input }} type="file"/>
            </div>
          </div>
          <div className="row">
            <div className="col s2 m2 offset-m1">
              <br/><b>Image</b>
            </div>
            <div className="col s10 m8 input-field">
              <input onChange={this.onImageChange} ref={(input) => { this.imageFileInput = input }} type="file"/>
            </div>
          </div>
          <div className="row">
            <div className="col s2 m2 offset-m1">
              <br/><b>Key</b>
            </div>
            <div className="col s10 m8 input-field">
              <input ref={(input) => { this.keyInput = input }} type="text"/>
            </div>
          </div>
          <div className="row">
            <div className="col s2 m2 offset-m1">
              <br/><b>Key</b>
            </div>
            <div className="col s10 m8 input-field">
              <input ref={(input) => { this.thresholdInput = input }} type="text" defaultValue="0.7"/>
            </div>
          </div>
          <div className="row">
            <div className="col s2 m2 offset-m1">
              <br/><b>Output Type</b>
            </div>
            <div className="input-field col s10 m8 input-field">
              <select ref={(input) => { this.outputTypeInput = input }}>
                <option value="image/png">PNG</option>
                <option value="image/bmp">BMP</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col s10 m9 offset-m3 offset-s2">
              <input id="using-encryption" type="checkbox" className="filled-in" ref={(input) => {this.usingEncyrptionInput = input}}/>
              <label htmlFor="using-encryption">Encrypt message first</label>
              <br/>
              <input id="using-cgc" type="checkbox" className="filled-in" ref={(input) => {this.usingCgcInput = input}}/>
              <label htmlFor="using-cgc">Use CGC system</label>
              <br/>
              <input id="using-random" type="checkbox" className="filled-in" ref={(input) => {this.usingRandomInput = input}}/>
              <label htmlFor="using-random">Input message randomly</label>
            </div>
          </div>
          <br/>
          <div className="row center">
            <div className="col s12 m11 offset-m1">
                <a className="waves-effect waves-light btn" onClick={this.insertMessage}>Process</a>
            </div>
          </div>
        </div>

        {/* Preview section */}
        <div className="col s12 m3">
          <span>Before</span>
          <Image
            filename={this.state.currentImageFilename}
            alt="plain-image"
            src={this.state.currentImage}
            align="center" 
            width="100%"
            height="100%" />
          <span>After</span>
          <Image
            filename={this.state.resultImageFilename}
            alt="messaged-image"
            src={this.state.resultImage}
            align="center"
            width="100%"
            height="100%" />
        </div>
        
      </div>
    );
  }
}

export default InsertForm;
