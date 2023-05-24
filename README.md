# Phrasal Player

This project is a git submodule that can be used in React apps to play and edit phrases (time intervals) with different options. It can be used in educational apps and caption/subtitle editors.

[Demo project repo](https://github.com/ApayRus/phrasal-player-demo)

Phrasal player uses `wavesurfer.js` to:

- track current phrase while playing audio or video
- play particular phrase
- play phrases in different scenarios (e.g. with repeats, delays, as dictation)
- edit phrases (add and change time intervals)

This repo contains Phrasal Player itself (as a git submodule) and a small demo app showing how it works.

## Install

```
git submodule add https://github.com/ApayRus/phrasal-player-provider src/components/PlayerProvider
```

## Usage

App.tsx

```tsx
import PhrasalPlayerProvider, { PlayerContext } from './PhrasalPlayer/Provider'
import YourPlayerComponent from './YourPlayerComponent'

const mediaLink = '/audios/001.mp3'

const phrases = [
	{ start: 1, end: 2, text: 'phrase1' },
	{ start: 3, end: 4, text: 'phrase2' },
	{ start: 5, end: 6, text: 'phrase3' }
]

const App = () => {
	return (
		<PhrasalPlayerProvider
			mediaLink={mediaLink}
			phrases={phrases}
		></PhrasalPlayerProvider>
	)
}
```

YourPlayerComponent.tsx

```tsx
import { useContext } from 'react'
import { PlayerContext } from './PhrasalPlayer/Provider'

const YourPlayerComponent = () => {
	const { state: playerState, methods: playerMethods } =
		useContext(PlayerContext)

	return (
		<div>
			<div>{playerState.currentTime}</div>
			<div>{playerState.currentPhrase}</div>
			<button onClick={() => playerMethods.play()}>play</button>
			<button onClick={() => playerMethods.pause()}>pause</button>
		</div>
	)

	export default YourPlayerComponent
}
```

## State

- phrases
- mediaLink
- currentTime
- isPlaying
- isReady
- currentPhraseNum

## Methods

- setMediaLink
- addPhrases
- removePhrases
- play
- pause
- playPhrase

## Advanced settings
