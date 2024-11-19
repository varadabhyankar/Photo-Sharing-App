/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
import axios from 'axios';

function fetchModel(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(response => {
        resolve({ data: response.data });
      })
      .catch(err => {
        reject(new Error({
          status: err.response ? err.response.status : 500,
          statusText: err.response ? err.response.statusText : "Network error"
        }));
      });
  });
}

export default fetchModel;