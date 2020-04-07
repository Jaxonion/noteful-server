const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, note_id, content, folder_id } = req.body
        const newNote =  { title, note_id, content, folder_id}

        for (const [key, value] of Object.entries(newNote))
            if(value==null)
                return res.status(400).json({
                    error: {
                        message: `Missing ${key} in request body`
                    }
                })
        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    //.json(serializeComment(comment))

            })
            .catch(next)
    })

    notesRouter
        .route('/:note_id')
        /*.all((req, res, next) => {
            NotesService.getbyId(
                req.app.get('db'),
                req.params.note_id
            )
                .then(note => {
                    if (!note) {
                        return res.status(404).json({
                            error: { message: `Comment doesn't exist`}
                        })
                    }
                    res.note = note
                    next()
                })
                .catch(next)
        })*/
        .get((req, res, next) => {
            res.json(serializeNote(res.note))
        })
        .delete((req, res, next) => {
            //console.log()
            NotesService.deleteNote(
                req.app.get('db'),
                req.params.note_id
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch(jsonParser, (req, res, next) => {
            const {} = req.body
            const noteToUpdate = {}

            const numberOfValues = Object.values(noteToUpdate)
            if (numberOfValues=== 0)
                return res.status(400).json({
                    error: {
                        message: `Resquest body must contain either title or content`
                    }
                })
            NotesService.updateNote(
                req.app.get('db'),
                req.params.note_id,
                noteToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })

        module.exports = notesRouter