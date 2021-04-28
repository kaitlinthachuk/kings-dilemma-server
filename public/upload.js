const socket = io()
const root = document.getElementById('root')

// helpers
// https://stackoverflow.com/a/15373215
Handlebars.registerHelper('select', (value, options) => {
    const selectElem = document.createElement('select')
    selectElem.innerHTML = options.fn(this)
    selectElem.value = value
    selectElem.children[selectElem.selectedIndex].setAttribute('selected', '')
    return selectElem.innerHTML
})

// templates
const photoUploadTemplate = Handlebars.compile(`
<h2>Upload a Photo</h2>
    <h2>Voting Url:</h2> {{votingUrl}} <br>
    <h2>Chronicle Stickers Url:</h2> {{chronicleUrl}} <br>
    <br>
    <form id="photoUpload" onsubmit="uploadPhoto();return false">
        <input id="chronicle-sticker" name="upload" value="chronicle" type="radio">
        <label for="chronicle-sticker">Chronicle Sticker</label>
        <input id="voting-card" name="upload" value="voting-card" type="radio" checked>
        <label for="voting-card">Voting Card</label>
        <label for="upload-img">Select image:</label>
        <input id= 'upload-img' name="file-upload" type="file"/>
        <input type="submit" value="Upload">
    </form>
`)

const uploadPhoto = () => {
    const formElem = document.querySelector(`#photoUpload`)
    const formData = new FormData(formElem);
    const type = formData.get('upload')
    const fileInput = formData.get('file-upload')
    let sendData = new FormData()
    sendData.append('file', fileInput);
    sendData.append('upload_preset', 'l8ge128e');
    fetch('https://api.cloudinary.com/v1_1/didsjgttu/image/upload', {
        method: 'POST',
        body: sendData
    })
        .then(res => res.json())
        .then(res => {
            console.log("res", res)
            if (type === "chronicle") {
                socket.emit("game:updateChronicleUrl", res.secure_url)
            } else {
                socket.emit("game:updateVotingCardUrl", res.secure_url)
            }

        })
        .catch(err => console.log(err));
}

socket.emit('game:getState')
socket.on(
    'game:state',
    ({
        votingCardUrl,
        chronicleStickersUrl
    }) => {
        const compiled = [
            photoUploadTemplate({ "votingUrl": votingCardUrl, "chronicleUrl": chronicleStickersUrl })
        ]

        root.innerHTML = compiled
            .map((html) => `<div class="card">${html}</div>`)
            .join('')
    },
)