import React, { Component } from 'react'
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
    data.append('imageFile', this.imageFileInput.files[0])
    data.append('key', this.keyInput.value)
    data.append('threshold', this.thresholdInput.value)

    fetch('/retrieve', {
      method: 'POST',
      body: data
    }).then((resp) => {
      return resp.blob()
    }).then((resp) => {
      var a = document.createElement('a')
      a.href = resp
      a.download = "filename"
      a.click()
    }).catch((error) => {
      console.log(error)
    })

  }

  render() {
    return (
      <div style={{marginBottom: 50}}>

        <form action="#">

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
              <input ref={(input) => { this.thresholdInput = input }} type="text" className="form-control" value="0.7" />
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
