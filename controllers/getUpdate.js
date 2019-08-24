const Post = require('../database/models/Post')
 
module.exports = async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id);
    res.render("update", {
        post
    });
}