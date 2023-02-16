import React, { useState } from "react"
export const EditButton = (editedPost) => {
    let editPost = editedPost

    let editedPostThreads = editPost["post"]["post-threads"].split("#").map((thread, i) => {
        console.log({ thread })
        if (thread != "") {
            if (i < editPost["post"]["post-threads"].split("#").length - 1) {
                return thread.slice(0, - 1)
            } else {
                return thread
            }
        } else {
            return ""
        }
    }).filter(e => e !== "")
    const [urlImage, setUrlImage] = useState("")
    const [selectedImage, setSelectedImage] = useState(null)
    const [localImage, setLocalImage] = useState("")
    const [emoji, setEmoji] = useState(editPost["post"]["post-text-content"])
    const [thread, setThread] = useState("")
    const [threadArr, setThreadArr] = useState(editedPostThreads)
    const [visible, setVisible] = useState(false)
    const [local, setLocal] = useState(false)


    const [displayImg, setDisplayImg] = useState(true)

    const openEditPostForm = () => {
        setVisible((prev) => !prev)
    };

    const closeEditPostForm = () => {
        resetForm()
        setVisible((prev) => !prev)
    };

    const handleLocalChange = (location) => {
        if (location) {
            setLocal(true)
        } else {
            setLocal(false)
        }

    }

    const addThread = () => {
        if (thread != "") {
            let hashtag = "#" + thread
            setThreadArr(threadArr => {
                if (threadArr !== null) {
                    return [...threadArr, hashtag]
                } else {
                    return [hashtag]
                }
            })
            setThread("")
        }
    }
    const removeThread = (index) => {
        const newThreads = threadArr.filter((_, i) => i !== index);
        setThreadArr(newThreads);
    }

    const resetForm = () => {
        setDisplayImg(true)
        setEmoji(editPost["post"]["post-text-content"])
        setThreadArr(editedPostThreads)
        setThread("")
        setLocalImage("")
        setSelectedImage(null)
        setLocal(false)

    }

    const handleEditPostSubmit = (evt) => {
        evt.preventDefault()
        const data = new FormData(evt.target);
        let values = Object.fromEntries(data.entries())
        console.log({ values })
        if (local) {
            values["post-image"] = localImage
        } else {
            values["post-image"] = urlImage
        }
        if (threadArr.length != 0) {
            values["post-threads"] = threadArr.join(",")
        }


        // fetch("http://localhost:8080/edit-post", {
        //     method: "POST",
        //     headers: {
        //         'Content-Type': "multipart/form-data"
        //     },
        //     body: JSON.stringify(values),
        // })
        //     .then(response => response.json())
        //     // return array of posts and send to the top.
        //     .then(response => {
        //         console.log(response)
        // return full post, not array
        //         editedPost["func"](response)
        //         closeEditPostForm()
        //     })

    }

    return (
        <>
            {visible &&
                <div className="edit-post-container">
                    <form className="edit-post-form" onSubmit={handleEditPostSubmit} >
                        <input type="hidden" name="post-id" value={editedPost["post"]["post-id"]} />
                        <div className="edit-post-header">
                            <button className="create-post-close-button" type="button" onClick={closeEditPostForm}>
                                <span>&times;</span>
                            </button>
                            <h1>Edit Post </h1>
                            <button type="button" className="reset-edit-post-button" onClick={resetForm}> Reset</button>
                        </div>


                        <div className="image-location">
                            <div>
                                <input type="radio" id="Url" name="img-location" value="Url" onChange={() => handleLocalChange(false)} checked={!local} defaultChecked />
                                <label htmlFor="Url">Online</label>
                            </div>
                            <div>
                                <input type="radio" id="local" name="img-location" value="local" onChange={() => handleLocalChange(true)} checked={local} />
                                <label htmlFor="local">Local</label>
                            </div>
                        </div>


                        {displayImg ? (
                            <div className="create-post-image-container">
                                {editPost["post"]["post-image"] &&
                                    <img src={editPost["post"]["post-image"]} onClick={() => setDisplayImg(false)} />
                                }
                            </div>
                        ) : (
                            <>
                                {local ? (
                                    <>
                                        <div className="create-post-image-container">
                                            {selectedImage &&
                                                <img src={URL.createObjectURL(selectedImage)} alt="" onClick={() => {
                                                    document.querySelector(".create-post-image").value = ""
                                                    setLocalImage("")
                                                    setSelectedImage(null)
                                                }} />
                                            }</div>
                                        <div className="add-post-image">
                                            <input type="file" className="create-post-image" onChange={(e) => {
                                                if (e.target.files[0].size < 20000000) {
                                                    setSelectedImage(e.target.files[0])
                                                    const fileReader = new FileReader();
                                                    fileReader.onload = function (e) {
                                                        setLocalImage(e.target.result);
                                                    };
                                                    fileReader.readAsDataURL(e.target.files[0]);
                                                }
                                                ;
                                            }} />

                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="create-post-image-container">
                                            {urlImage &&
                                                <div className="create-post-image-container">
                                                    <img src={urlImage} alt="" onClick={() => {
                                                        document.querySelector(".create-post-image").value = ""
                                                        setUrlImage("")
                                                    }} />
                                                </div>}

                                        </div>
                                        <div className="add-post-image">
                                            <input type="text" className="create-post-image" id="create-post-image" placeholder="https://..."
                                                onChange={(e) => setUrlImage(e.target.value)}
                                            />
                                            <label htmlFor="create-post-image">Add Image</label>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        <p>File Must Not Exceed 20MB</p>
                        <div className="create-post-textarea" contentEditable={true}>
                            <textarea name="post-text-content" className="post-text-content" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="For Emojis Press: 'Windows + ;' or 'Ctrl + Cmd + Space'" />
                        </div>
                        <div className="create-post-threads">
                            <input type="text" className="add-thread-input" placeholder="Add Thread" value={thread} onChange={(e) => setThread(e.target.value)} />
                            <button className="add-thread-button" type="button" onClick={addThread}>+</button>
                            {threadArr &&
                                <>
                                    <p>Click the # to remove</p>
                                    <div className="thread-container">
                                        {threadArr.map((t, index) =>
                                            <p key={index} className="added-thread" onClick={() => removeThread(index)}>{t}</p>
                                        )
                                        }
                                    </div>
                                </>
                            }

                        </div>

                        <input type="submit" className="create-post-submit-button" value="Create" />
                    </form>
                </div >
            }
            <button type="button" onClick={openEditPostForm}>
                <img src="../../public/assets/img/edit.png" />
            </button>
        </>
    )
}