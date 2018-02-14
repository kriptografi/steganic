import React, { Component } from 'react'

class Image extends Component {
  render() {
    return (
      <div style={{maxWidth: this.props.width, maxHeight: this.props.maxHeight}}>
          <img src={this.props.src} style={{maxWidth: "100%", height: "auto"}}/>
      </div>
    );
  }
}

export default Image;
