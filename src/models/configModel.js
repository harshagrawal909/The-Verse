import mongoose from "mongoose"

const configSchema = new mongoose.Schema({
    configId: {
        type: String,
        required: true,
        unique: true,
        default: 'global'
    },
    
    heroTitle: {
        type: String,
        default: "Welcome to The Verse"
    },
    heroSubtitle: {
        type: String,
        default: "Dive into worlds crafted with passion and precision. Harsh Agrawal is a storyteller dedicated to helping you explore his captivating narratives that delve into the human condition and inspire the imagination."
    },
    
    aboutSummary: {
        type: String,
        default: "Harsh Agrawal is an aspiring software developer and creative technologist with a deep passion for building impactful digital experiences. Known for his curiosity and commitment to continuous learning, he explores the intersection of technology, design, and storytelling through his projects and ideas."
    },
    aboutBioLong: {
        type: String,
        default: `Currently pursuing a Bachelor’s degree in Computer Science and Engineering at KIIT University, Harsh has developed skills in full-stack development, machine learning, and software design. His academic and personal projects reflect a balance of technical precision and creative problem-solving, aiming to deliver meaningful solutions that enhance user experience.
                            Beyond coding, Harsh is also an emerging author working on an original fantasy series titled "Legends of the Five Kingdoms", where he channels his imagination into world-building and storytelling. This creative side complements his technical mindset, allowing him to think holistically — both logically and emotionally — in every project he undertakes.
                            With a growing portfolio of innovative projects and a passion for learning new technologies, Harsh aspires to contribute to teams that value creativity, collaboration, and impact. He believes that technology, when combined with imagination and purpose, has the power to change the world for the better.`
    },
    
    authorImageUrl: {
        type: String,
        default: "/images/admin.jpg" 
    },
    
    adminProfileImage: {
        type: String,
        default: "/images/user-avatar.png" 
    },


}, { timestamps: true });

const Config = mongoose.models.config || mongoose.model("config", configSchema);
export default Config