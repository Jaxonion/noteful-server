const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const FoldersService = require('./folders-service')
//const { getBookmarkValidationError } = require('./bookmark-validator')

const foldersRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = folder => ({
  id: folder.folder_id,
  title: folder.name
})

foldersRouter
  .route('/')

  .get((req, res, next) => {
    FoldersService.getAllFolders(req.app.get('db'))
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const { folder_id, name } = req.body
    const newFolder = { folder_id, name }

    for (const field of ['name']) {
      if (!newFolder[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    //const error = getBookmarkValidationError(newBookmark)

    //if (error) return res.status(400).send(error)

    FoldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        logger.info(`Folder with id ${folder.folder_id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${folder.folder_id}`))
          .json(serializeFolder(folder))
      })
      .catch(next)
  })


foldersRouter
  .route('/:folder_id')

  .all((req, res, next) => {
    const { folder_id } = req.params
    FoldersService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found.`)
          return res.status(404).json({
            error: { message: `Bookmark Not Found` }
          })
        }

        res.bookmark = bookmark
        next()
      })
      .catch(next)

  })

  .get((req, res) => {
    res.json(serializeBookmark(res.folder))
  })

  .delete((req, res, next) => {
    const { folder_id } = req.params
    foldersService.deleteBookmark(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
        logger.info(`Folder with id ${folder_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(bodyParser, (req, res, next) => {
    const { title, url, description, rating } = req.body
    const folderToUpdate = { title, url, description, rating }

    const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title', 'url', 'description' or 'rating'`
        }
      })
    }

    const error = getFolderValidationError(folderToUpdate)

    if (error) return res.status(400).send(error)

    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = foldersRouter
