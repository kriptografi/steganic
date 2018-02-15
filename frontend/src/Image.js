import React, { Component } from 'react'

class Image extends Component {
  render() {
    let source = this.props.src ? this.props.src : '/unknown.png'
    return (
      <div style={{maxWidth: this.props.width, maxHeight: this.props.maxHeight, textAlign: this.props.align}}>
          <img alt={this.props.alt} align="center" src={source} style={{maxWidth: "100%", height: "auto"}}/>
          <div style={{textAlign:"center"}} >
          {
            function() {
              if (this.props.src) {
                return <a href={source} download={this.props.filename || "image.png"}>Download</a>
              }
            }.apply(this)
          }
          </div>
      </div>
    );
  }
}

export default Image;
