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
    this.updateKeyUI = this.updateKeyUI.bind(this)
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

  updateKeyUI() {
    this.keyInput.disabled = !this.randomBlockInput.checked && !this.decryptInput.checked
  }

  retrieveMessage() {
    let data = new FormData()
    data.append('image', this.imageFileInput.files[0])
    data.append('key', this.keyInput.value)
    data.append('threshold', this.thresholdInput.value)
    data.append('usingCgc', this.usingCgcInput.checked ? true : false)
    data.append('usingRandomBlock', this.randomBlockInput.checked ? true : false)
    data.append('usingDecrypt', this.decryptInput.checked ? true : false)

    let filename = ''
    fetch('/stego/retrieve', {
      method: 'POST',
      body: data
    }).then((resp) => {
      filename = resp.headers.get('X-Steganic-Filename')
      return resp.blob()
    }).then((resp) => {
      var a = document.createElement('a')
      a.href = window.URL.createObjectURL(resp)
      a.download = filename
      a.click()
    }).catch((error) => {
      new Noty({
        text: (error || 'Cannot retrieve message'),
        type: 'error',
        theme: 'nest',
      }).show()
    })

  }

  render() {
    return (
      <div style={{marginBottom: 50}}>

        <form>

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
              <input ref={(input) => { this.keyInput = input }}
                type="text"
                disabled
                className="form-control" />
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
              <div className="form-check">
                <label className="form-check-label">
                  <input
                    ref={(input) => {this.randomBlockInput = input}}
                    onChange={this.updateKeyUI}
                    className="form-check-input"
                    type="checkbox" /> Using random blocks
                </label>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <div className="col-sm-2" />
            <div className="col-sm-10">
              <div className="form-check">
                <label className="form-check-label">
                  <input ref={(input) => {this.decryptInput = input}}
                    onChange={this.updateKeyUI}
                    className="form-check-input"
                    type="checkbox" /> Decrypt message
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
        </div>

      </div>
    );
  }
}

export default RetrieveForm;
