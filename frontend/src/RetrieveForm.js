import React, { Component } from 'react'
import 'noty/lib/noty.css'
import 'noty/lib/themes/nest.css'
import Noty from 'noty'
import Image from './Image'

class RetrieveForm extends Component {
  constructor(props) {
    super(props)
    this.state = {currentImage: null}

    this.onImageChange = this.onImageChange.bind(this)
    this.retrieveMessage = this.retrieveMessage.bind(this)
  }

  onImageChange() {
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

  retrieveMessage() {
    let data = new FormData()
    data.append('image', this.imageFileInput.files[0])
    data.append('key', this.keyInput.value)
    data.append('threshold', this.thresholdInput.value)
    data.append('usingCgc', this.usingCgcInput.checked ? true : false)

    fetch('/stego/retrieve', {
      method: 'POST',
      body: data
    }).then((resp) => {
      return resp.blob()
    }).then((resp) => {
      var a = document.createElement('a')
      a.href = window.URL.createObjectURL(resp)
      a.download = "filename"
      a.click()
    }).catch((error) => {
      console.log(error)
      new Noty({
        text: (error || 'Cannot retrieve message'),
        type: 'error',
        theme: 'nest',
      }).show()
    })

  }

  render() {
    return (
      <div>

        <div className="col s12 m8">
          <div className="row">
            <div className="col s2 m2 offset-m1">
              <br/><b>Image</b>
            </div>
            <div className="col s10 m8 input-field">
              <input ref={(input) => { this.imageFileInput = input }} type="file" onChange={this.onImageChange}/>
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
              <br/><b>Threshold</b>
            </div>
            <div className="col s10 m8 input-field">
              <input ref={(input) => { this.thresholdInput = input }} type="text" defaultValue="0.7"/>
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
                <a className="waves-effect waves-light btn" onClick={this.retrieveMessage}>Retrieve</a>
            </div>
          </div>
        </div>

        {/* Preview section */}
        <div className="col s12 m3">
          <Image 
            alt="plain-image" 
            align="center" 
            src={this.state.currentImage} 
            width="100%" 
            height="100%" />
        </div>

        {/* <form>

          <div className="form-group row">
            <label className="col-sm-2 col-form-label">Image</label>
            <div className="col-sm-10">
              <input
                ref={(input) => { this.imageFileInput = input }}
                onChange={this.onImageChange}
                type="file"
                className="form-control-plaintext" />
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
              <button onClick={this.retrieveMessage} className="btn btn-primary">Retrieve</button>
            </div>
          </div>

        </form>

        <div className="row">
          <div className="col-sm-12">
            <Image alt="plain-image" align="center" src={this.state.currentImage} width="100%" height="100%" />
          </div>
        </div> */}

      </div>
    );
  }
}

export default RetrieveForm;
