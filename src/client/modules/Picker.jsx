import React from 'react'

import '../styles/Picker.css'

class Picker extends React.Component {
  constructor (props) {
    super(props)

    this.indicies = new Array(this.props.columns.length).fill(0)
    this.columns = this.props.columns

    for (let c = 0; c < this.columns.length; c++) {
      if (this.columns[c].type === 'numerical') {
        this.columns[c].values = []

        for (let i = this.columns[c].range[0]; i <= this.columns[c].range[1]; i++) this.columns[c].values.push(i)
      }
    }
  }

  componentDidMount () {
    const scrollers = document.getElementsByClassName('picker scroller')

    for (let s = 0; s < scrollers.length; s++) scrollers[s].onscroll = this.scrollFunction.bind(this, scrollers[s], s)
  }

  render () {
    return (
      <div className='picker main container'>
        {this.props.columns.map((c, i) => (
          <div className='picker column container' key={i}>
            <div className='picker header'>{c.title}</div>

            <div className='picker scroller'>
              {c.values.map((v, i) => (
                <div className='picker value' key={i}>
                  <div>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  scrollFunction (scroller, sIndex) {
    const index = Math.round(scroller.scrollTop *
      scroller.children.length /
      (scroller.scrollHeight - (parseFloat(getComputedStyle(scroller).paddingTop) * 2)))

    if (index !== this.indicies[sIndex]) {
      this.indicies[sIndex] = index

      this.props.onUpdate(this.indicies)

      const startIndex = this.indicies[sIndex] - 4 < 0 ? 0 : this.indicies[sIndex] - 4
      const endIndex = this.indicies[sIndex] + 4 >= scroller.children.length ? scroller.children.length - 1 : this.indicies[sIndex] + 4

      for (let i = startIndex; i <= endIndex; i++) scroller.children[i].children[0].style.transform = `scale(${1 - (Math.abs(index - i) / 4)})`
    }
  }
}

export default Picker
