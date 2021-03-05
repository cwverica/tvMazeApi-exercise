const baseURL = 'http://api.tvmaze.com/';

/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const queryString = `search/shows?q=${query}`;
  const res = await axios.get(`${baseURL}${queryString}`);
  const returnArray = [];

  for(let show of res.data) {
    const showData = {id: show.show.id, name: show.show.name, summary: show.show.summary,
      image: show.show.image, premiered: show.show.premiered};
    returnArray.push(showData);
  }

  return returnArray;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM with episode button
 */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let id = show.id;
    let name = show.name;
    let summary = show.summary;
    let premiered = '';
    if (show.premiered == null){
      premiered = 'unlisted';
    } else {
      premiered = show.premiered;
    }
    let imgPath = 'https://www.staticwhich.co.uk/static/images/products/no-image/no-image-available.png';
    if (show.image){
      imgPath = show.image.original;
    }
      let $item = $(
        `<div class="col-md-6 col-lg-3 Show" data-show-id="${id}">
           <div class="card" data-show-id="${id}">
             <div class="card-body">
               <img class="card-img-top" src="${imgPath}">
               <h5 class="card-title">${name}</h5>
               <h7 class="card-subtitle mb-2 text-muted">Premier date: ${premiered}</h7>
               <p class="card-text">${summary}</p>
               <button type="button" class="btn btn-info episode-button">Show Episodes</button>
             </div>
           </div>
         </div>
        `);

    $showsList.append($item);
  }
  $(".episode-button").on("click", async function showEpisodes(evt){
    evt.preventDefault();

    let showID = evt.target.parentElement.parentElement.dataset.showId;
    let episodeList = await getEpisodes(showID);
    populateEpisodes(episodeList);
  });
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  let shows = await searchShows(query);

  populateShows(shows);
});


/** getEpisodes: Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const queryString = `shows/${id}/episodes`;
  const res = await axios.get(`${baseURL}${queryString}`);
  const returnArray = [];

  for (let episode of res.data){
    const episodeData = {id: episode.id, name: episode.name, season: episode.season, number:episode.number};
    returnArray.push(episodeData);
  }

  return returnArray;
}

/** populateEpisodes: takes an array list of objects (episodes) of the given format:
 * { id, name, season, number}
 * 
 * Generates an unorderd list made up of information from each episode.
  */
function populateEpisodes(episodes) {
  const $episodesArea = $("#episodes-area");
  $episodesArea.empty();
  $episodesArea.append("<ul>");

  for (let episode of episodes) {
      let $item = $(
        `<li>
          "${episode.name}" - S${episode.season}:E${episode.number}
        </li>
        `);

    $episodesArea.append($item);
  }
  $episodesArea.append('</ul>').show();

}
