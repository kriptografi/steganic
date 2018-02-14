import React, { Component } from 'react'
import Image from './Image'

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

        <form>
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
              <button onClick={this.insertMessage} className="btn btn-primary">Insert</button>
            </div>
          </div>

        </form>

        <div>
          <Image alt="plain-image" src={this.state.currentImage} width={200} height={200} />
        </div>
        <div>
          <Image alt="messaged-image" src={this.state.resultImage} width={200} height={200} />
        </div>

      </div>
    );
  }
}

export default InsertForm;
