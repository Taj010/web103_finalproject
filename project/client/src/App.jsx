import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useRoutes } from "react-router-dom";
import Navigation from './components/Navigation'

import Home from './pages/Home'
import AllJournals from './pages/AllJournals'
import CreateJournal from './pages/CreateJournal'
import AllPages from './pages/AllPages'
import PageDetails from './pages/PageDetails'
import AddPage from './pages/AddPage'
import PreviewPage from './pages/PreviewPage'

import './App.css'

const App = () => {
  const location = useLocation()
  const element = useRoutes([
    {
      path: '/',
      element: <Home title="StickerStory" />
    },
    {
      path: '/journals',
      element: <AllJournals title="All Journals" />
    },
    {
      path: '/journals/create',
      element: <CreateJournal title="Create Journal" />
    },
    {
      path: '/journals/:journalId/pages',
      element: <AllPages title="Journal Pages" />
    },
    {
      path: '/journals/:journalId/pages/add',
      element: <AddPage title="Add Page" />
    },
    {
      path: '/journals/:journalId/pages/:pageId',
      element: <PageDetails title="Page Details" />
    },
    {
      path: '/journals/:journalId/pages/:pageId/preview',
      element: <PreviewPage title="Preview Page" />
    }
  ])

  return (
    <div className='app'>
      {location.pathname !== '/' && <Navigation />}
      {element}
    </div>
  )
}

export default App
