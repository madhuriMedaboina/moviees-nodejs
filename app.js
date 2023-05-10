const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (movieObject) => {
  return {
    movieId: movieObject.movie_id,
    directorId: movieObject.director_id,
    movieName: movieObject.movie_name,
    leadActor: movieObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

// GET movies

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
        movie_name
    FROM 
        movie`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API POST movie

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
        movie(director_id,movie_name,lead_actor)
    VALUES 
        (${directorId},'${movieName}','${leadActor}')`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

/// GET movieId

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
        *
    FROM 
        movie 
    WHERE 
        movie_id = ${movieId}
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

/// API UPDATE movie

app.put("/movies/:movieId/,", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE 
        movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API delete

app.delete("/movies/:movieId/", async (request, response) => {
  const deleteMovie = `
    DELETE FROM
        movie 
    WHERE 
        movie_id = ${movieId}
    `;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

// API GET directors

app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT 
        *
    FROM 
        director
    `;
  const directors = await db.all(getDirectors);
  response.send(
    directors.map((eachDirector) =>
      convertMovieDbObjectToResponseObject(eachDirector)
    )
  );
});

/// API get movieName based on directorId

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovie = `
    SELECT 
        movie_name
    FROM 
        movie 
    WHERE 
        director_id = '${directorId}'
    `;
  const movieArray = await db.all(getDirectorMovie);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
