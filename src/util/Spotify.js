let accessToken 
const clientId = 'd5bb7c8227d54ef69b5b97720060191c'
const redirectURL = 'http://localhost:3000/'
const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken
        } 
        const accessTokenMatch =  window.location.href.match(/access_token=([^&]*)/)
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1]
            const expiresIn = Number(expiresInMatch[1])
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return (accessToken)
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURL}`
            window.location = accessURL
        }
    },
    search(term){
        const accessToken = Spotify.getAccessToken()
        const searchUrl = `https://api.spotify.com/v1/search?type=track&q=${term.replace(' ', '%20')}`;
        return fetch(searchUrl, {
            headers: {
            Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            console.log(response)
            return response.json
        }).then(jsonResponse => {
            if (!jsonResponse) {
                return []
            } else {
                
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artists: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }))
            }
        })
    },
    savePlaylist(name, trackURIs) {
        if (!name || !trackURIs.length) {
            return
        }
        const accessToken = Spotify.getAccessToken()
        const headers = {Authorization: `Bearer ${accessToken}`}
        let userId
        //request to fetch user's spotify username
        return fetch(`https://api.spotify.com/v1/me`, {headers: headers})
            .then(response => response.json())
            .then(jsonResponse => {
                userId = jsonResponse.id
                //req to create new playlist
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,  
                {
                    headers: headers, 
                    method: 'POST',
                    body: JSON.stringify({name: name})
                })
                .then(respone => respone.json())
                .then(jsonResponse => {
                    const playlistId = jsonResponse.id
                    return fetch(`https://api.spotify.com/playlists/v1/users/${userId}/playlists/${playlistId}/tracks`,
                    {headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackURIs})})
                })
            })

    }

}

export default Spotify