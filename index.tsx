import { createContext, useEffect, useRef, useState } from 'react'
import { RegionsPluginParams } from 'wavesurfer.js/src/plugin/regions'
import { WaveSurferParams } from 'wavesurfer.js/types/params'
import { initWavesurfer } from './wavesurfer'

interface Props {
	children: JSX.Element
	mediaLink?: string
	phrases?: Phrase[]
	regionsOptions?: RegionsPluginParams
	wavesurferOptions?: WaveSurferParams
}

export interface Phrase {
	id?: string
	start: number
	end: number
	text?: string
}

export interface PlayerContextState {
	phrases: Phrase[]
	mediaLink: string
	currentTime: number
	isPlaying: boolean
	isReady: boolean
	currentPhraseId: string
	currentPhraseNum: number
}

interface PlayerContextMethods {
	setMediaLink: (mediaLink: string) => void
	addPhrases: (phrases: Phrase[]) => void
	removePhrases: () => void
	play: () => void
	pause: () => void
	playPhrase: (phraseId: string) => void
}

interface PlayerContextType {
	state: PlayerContextState
	methods: PlayerContextMethods
}

export const PlayerContext = createContext({} as PlayerContextType)

const defaultWavesurferParams = {
	backend: 'MediaElement',
	// waveColor: '#A8DBA8',
	// progressColor: '#3B8686',
	minPxPerSec: 50,
	// height: 100,
	normalize: true,
	autoCenter: true,
	scrollParent: true
} as WaveSurferParams

const defaultRegionsPluginParams = {
	dragSelection: true,
	contentEditable: true,
	removeButton: true
} as RegionsPluginParams

const PlayerProvider: React.FC<Props> = ({
	children,
	mediaLink: mediaLinkDefault = '',
	phrases: phrasesInitial = [],
	regionsOptions = defaultRegionsPluginParams,
	wavesurferOptions = defaultWavesurferParams
}) => {
	const mediaElementRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(
		null
	)
	const waveformContainerRef = useRef<HTMLDivElement | null>(null)
	const wavesurferTimelineRef = useRef<HTMLDivElement | null>(null)
	const wavesurferRef = useRef<any>(null)

	const zeroPhrase = { id: '0', start: 0, end: 0 }

	const [state, setState] = useState<PlayerContextState>({
		mediaLink: mediaLinkDefault,
		phrases: [zeroPhrase, ...phrasesInitial],
		currentTime: 0,
		isPlaying: false,
		isReady: false,
		currentPhraseId: '',
		currentPhraseNum: 0
	})

	useEffect(() => {
		if (
			state.mediaLink
			// &&
			// !wavesurferRef.current // otherwise renders waveform twice
		) {
			if (waveformContainerRef.current) {
				waveformContainerRef.current.innerHTML = ''
			}
			mediaElementRef.current = document.getElementById(
				'mediaElement'
			) as HTMLVideoElement
			waveformContainerRef.current = document.getElementById(
				'waveformContainer'
			) as HTMLDivElement
			wavesurferTimelineRef.current = document.getElementById(
				'timelineContainer'
			) as HTMLDivElement

			// console.log(document.getElementById('mediaElement'))

			const wavesurfer = initWavesurfer({
				waveformContainerRef,
				wavesurferTimelineRef,
				mediaElementRef,
				phrases: state.phrases.map(elem => ({
					...elem,
					data: { text: elem.text }
				})),
				regionsOptions,
				wavesurferOptions,
				setPlayerState: setState
			})

			wavesurferRef.current = wavesurfer
			mediaElementRef.current.controls = true
		}
	}, [state.mediaLink])

	const addPhrases = (newPhrasesRaw: Phrase[]) => {
		const newPhrases = newPhrasesRaw.map(phrase => {
			const id = (Math.random() + 1).toString(36).substring(7)
			return { ...phrase, id }
		})
		newPhrases.forEach(phrase => {
			wavesurferRef.current.addRegion(phrase)
		})
		setState(oldState => {
			const { phrases: oldPhrases } = oldState
			const phrases = [...oldPhrases, ...newPhrases].sort(
				(a, b) => a.start - b.start
			)
			// add zero phrase if it doesn't exist
			if (!phrases.find(elem => elem.start === 0 && elem.end === 0)) {
				phrases.unshift(zeroPhrase)
			}
			return { ...oldState, phrases }
		})
	}

	const removePhrases = () => {
		wavesurferRef.current.clearRegions()
		setState(oldState => ({ ...oldState, phrases: [zeroPhrase] }))
	}

	const setMediaLink = (mediaLink: string) => {
		setState(oldState => ({ ...oldState, mediaLink }))
	}

	const play = () => {
		wavesurferRef.current.play()
	}

	const pause = () => {
		wavesurferRef.current.pause()
	}

	const playPhrase = (phraseId: string) => {
		if (wavesurferRef.current) {
			wavesurferRef.current.regions.list[phraseId].play()
		}
	}

	const methods = {
		addPhrases,
		removePhrases,
		setMediaLink,
		play,
		pause,
		playPhrase
	} as PlayerContextMethods

	return (
		<PlayerContext.Provider value={{ state, methods }}>
			{children}
		</PlayerContext.Provider>
	)
}

export default PlayerProvider
