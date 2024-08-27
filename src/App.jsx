import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import YouTube from 'react-youtube';

function App() {
  const API_URL = 'https://api.themoviedb.org/3';
  const API_KEY = '42d50276ba59a2b5e889891d13c3f67c';
  const IMAGE_PATH = "https://image.tmdb.org/t/p/original";

  // Endpoint para las imágenes
  const URL_IMAGE = IMAGE_PATH;

  // Variables de estado
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [trailer, setTrailer] = useState(null);
  const [movie, setMovie] = useState({ title: "Loading Movies" });
  const [playing, setPlaying] = useState(false);

  // Función para realizar la petición GET a la API
  const fetchMovies = async (searchKey) => {
    try {
      const type = searchKey ? "search" : "discover";
      const { data: { results } } = await axios.get(`${API_URL}/${type}/movie`, {
        params: {
          api_key: API_KEY,
          query: searchKey,
        },
      });

      setMovies(results);
      setMovie(results[0]);

      if (results.length) {
        await fetchMovie(results[0].id);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  // Función para la petición de un solo objeto y mostrar en el reproductor de video
  const fetchMovie = async (id) => {
    try {
      const { data } = await axios.get(`${API_URL}/movie/${id}`, {
        params: {
          api_key: API_KEY,
          append_to_response: "videos",
        },
      });

      if (data.videos && data.videos.results) {
        const trailer = data.videos.results.find(
          (vid) => vid.name === "Official Trailer"
        );
        setTrailer(trailer ? trailer : data.videos.results[0]);
      }
      setMovie(data);
    } catch (error) {
      console.error("Error fetching movie:", error);
    }
  };

  const selectMovie = (movie) => {
    fetchMovie(movie.id);
    setMovie(movie);
    window.scrollTo(0, 0);
  };

  // Función para buscar películas
  const searchMovies = (e) => {
    e.preventDefault();
    fetchMovies(searchKey);
  };

  useEffect(() => {
    fetchMovies(""); // Cargar películas al inicio
  }, []);

  return (
    <>
      <div>
        {/* Título */}
        <h2
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            marginBottom: '1rem',
          }}
        >
          Películas en Cartelera
        </h2>
        {/* Buscador */}
        <form className='container mb-4' onSubmit={searchMovies}>
          <input
            type='text'
            placeholder='search'
            onChange={(e) => setSearchKey(e.target.value)}
          />
          {/* Botón */}
          <button
            className='btn btn-primary'>
            Search
          </button>
        </form>
        {/* Aquí va todo el contenedor del banner y del reproductor de video */}
        <div>
          <main>
            {movie && (
              <div
                className="viewtrailer"
                style={{
                  backgroundImage: `url("${IMAGE_PATH}${movie.backdrop_path}")`,
                }}
              >
                {playing ? (
                  <>
                    <YouTube
                      videoId={trailer.key}
                      className="reproductor container"
                      containerClassName={"youtube-container amru"}
                      opts={{
                        width: "100%",
                        height: "100%",
                        playerVars: {
                          autoplay: 1,
                          controls: 0,
                          cc_load_policy: 0,
                          fs: 0,
                          iv_load_policy: 0,
                          modestbranding: 0,
                          rel: 0,
                          showinfo: 0,
                        },
                      }}
                    />
                    <button onClick={() => setPlaying(false)} className="boton">
                      Close
                    </button>
                  </>
                ) : (
                  <div className="container">
                    <div className="">
                      {trailer ? (
                        <button
                          className="boton"
                          onClick={() => setPlaying(true)}
                          type="button"
                        >
                          Play Trailer
                        </button>
                      ) : (
                        "Sorry, no trailer available"
                      )}
                      <h1 className="text-white">{movie.title}</h1>
                      <p className="text-white">{movie.overview}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
        {/* Contenedor que va a mostrar los posters de las películas actuales */}
        <div className="container mt-3">
          <div className="row">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="col-md-4 mb-3"
                onClick={() => selectMovie(movie)}
              >
                <img
                  src={`${URL_IMAGE + movie.poster_path}`}
                  alt={`Poster of ${movie.title}`}
                  height={600}
                  width="100%"
                />
                <h4 className="text-center">{movie.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

