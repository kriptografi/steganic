import React, { Component } from 'react'

class Image extends Component {
  render() {
    return (
      <div style={{maxWidth: this.props.width, maxHeight: this.props.maxHeight, textAlign: this.props.align}}>
          <img align="center" src={this.props.src} style={{maxWidth: "100%", height: "auto"}}/>
      </div>
    );
  }
}

export default Image;
