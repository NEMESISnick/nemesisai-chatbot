import Conversation from "../models/conversation.model.js"

import Message from "../models/message.model.js"


export const createConversation = async (req, res) => {
 try {
    const userId = req.headers["x-user-id"]
    console.log("userId", userId)

    const conversation = await Conversation.create({
        userId: userId
    })

    return res.status(200).json(conversation)
 } catch (error) {
    res.status(500).json({
        message: `create conversation error: ${error}`
    })
 }   
}


export const getConversations = async (req, res) => {
 try {
    const userId = req.headers["x-user-id"]
    console.log("userId", userId)

    const conversations = await Conversation.find({
        userId: userId
    }).sort({updatedAt: -1})

    return res.status(200).json(conversations)
 } catch (error) {
    res.status(500).json({
        message: `get conversation error: ${error}`
    })
 }   
}


export const updateConversations = async (req, res) => {
 try {
    const {id, title} = req.body

    const conversation = await Conversation.findByIdAndUpdate(
        id,
        {title},
        {new: true}
    )

    if (!conversation) {
        return res.status(404).json({
            message: "conversation not found"
        })
    }

    return res.status(200).json(conversation)
 } catch (error) {
    res.status(500).json({
        message: `update conversation error: ${error}`
    })
 }   
}


export const saveMessage = async (req, res) => {
    try {
        const {conversationId, role, content, images, artifacts} = req.body
        const message = await Message.create({
            conversationId,
            content,
            role,
            images,
            artifacts
        })

    return res.status(200).json(message)

    } catch (error) {
        res.status(500).json({
            message: `save message error: ${error}`
        })
        
    }
}



export const getAllMessages = async (req, res) => {
    try {
        const {conversationId} = req.params
        const messages = await Message.find({
            conversationId
        })

    return res.status(200).json(messages)

    } catch (error) {
        res.status(500).json({
            message: `get message error: ${error}`
        })
        
    }
}
