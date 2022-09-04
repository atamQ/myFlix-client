import React from 'react';
import axios from 'axios';

import { MovieCard } from '../movie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';

export class MainView extends React.Component {

    constructor() {
        super();
        this.state = {
            movies: [
                // { _id: 1, Title: 'Inception', Description: 'description1', ImagePath: 'x.jpg' },
                //{ _id: 2, Title: 'The Shawshank Redemption', Description: 'description2', ImagePath: 'x.jpg' },
                //{ _id: 3, Title: 'Gladiator', Description: 'description3', ImagePath: 'x.jpg' }
            ], selectedMovie: null
        }
    }

    componentDidMount() {
        axios.get('https://matt-movie-site.herokuapp.com/movies')
            .then(response => {
                this.setState({
                    movies: response.data
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    setSelectedMovie(newSelectedMovie) {
        this.setState({
            selectedMovie: newSelectedMovie
        });
    }

    render() {
        const { movies, selectedMovie } = this.state;

        //if (selectedMovie) return <MovieView movie={selectedMovie} />

        if (movies.length === 0)
            return <div className="main-view">The list is empty</div>

        return (
            /* <div className="main-view">
                 {movies.map(movie => <MovieCard key={movie._id} movie={movie} onMovieClick={(movie) => { this.setSelectedMovie(movie) }} />)}
             </div>*/
            <div className="main-view">
                {selectedMovie
                    ? <MovieView movie={selectedMovie} onBackClick={newSelectedMovie => { this.setSelectedMovie(newSelectedMovie); }} />
                    : movies.map(movie => (
                        <MovieCard key={movie._id} movie={movie} //onMovieClick={(movie) => { this.setSelectedMovie(movie) }} />
                            onMovieClick={(newSelectedMovie) => { this.setSelectedMovie(newSelectedMovie) }} />
                    ))
                }
            </div>
        );

    }
}