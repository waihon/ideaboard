import React, { Component } from 'react';
import axios from 'axios';
import Idea from './Idea';
import update from 'immutability-helper';
import IdeaForm from './IdeaForm';
import Notification from './Notification';

class IdeasContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ideas: [],
      editingIdeaId: null, // keep track of which idea is being edited
      notification: ''
    }
  }

  componentDidMount() {
    axios.get('http://localhost:3001/api/v1/ideas.json')
      .then(response => {
        console.log(response);
        this.setState({ ideas: response.data });
      })
      .catch(error => console.log(error));
  }

  addNewIdea = () => {
    axios.post(
      'http://localhost:3001/api/v1/ideas',
      { idea:
        {
          title: '',
          body: ''
        }
      }
    )
      .then(response => {
        console.log(response);
        const ideas = update(this.state.ideas, {
          // Insert the new idea (in response.data) at the 0th index of the ideas array
          $splice: [[0, 0, response.data]]
        });
        this.setState({
          ideas: ideas,
          editingIdeaId: response.data.id // edit the idea immediately
        });
      })
      .catch(error => console.log(error))
  }

  updateIdea = (idea) => {
    const ideaIndex = this.state.ideas.findIndex(x => x.id === idea.id);
    const ideas = update(this.state.ideas, {
      // Replace the old idea with the new one
      [ideaIndex]: { $set: idea }
    });
    this.setState({
      ideas: ideas,
      notification: 'Changes saved'
    });
  }

  resetNotification = () => {
    this.setState({ notification: '' });
  }

  enableEditing = (id) => {
    this.setState({ editingIdeaId: id },
      // setState doesn't always immediately update the component.
      // By passing our focus call in a callback, we make sure it gets
      // called only after the component has been updated.
      () => { this.title.focus() });
  }

  deleteIdea = (id) => {
    axios.delete(`http://localhost:3001/api/v1/ideas/${id}`)
      .then(response => {
        const ideaIndex = this.state.ideas.findIndex(x => x.id === id);
        const ideas = update(this.state.ideas, {
          $splice: [[ideaIndex, 1]]
        });
        this.setState({ ideas: ideas });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div>
        <div>
          <button className="newIdeaButton" onClick={this.addNewIdea} >
            New Idea
          </button>
          <Notification notification={this.state.notification} />
        </div>
        {this.state.ideas.map((idea) => {
          if (this.state.editingIdeaId === idea.id) {
            return(<IdeaForm idea={idea} key={idea.id}
              updateIdea={this.updateIdea}
              resetNotification={this.resetNotification}
              titleRef={input => this.title = input} />);
          } else {
            return(<Idea idea={idea} key={idea.id}
              onClick={this.enableEditing}
              onDelete={this.deleteIdea} />);
          }
        })}
      </div>
    );
  }
}

export default IdeasContainer;
