module.exports = async (req,res) => {
    try {
        const post = await Post.findByIdAndDelete({_id: req.params.id})
        res.redirect('/')
    } catch (error) {
        res.status(500).send();
    }
}