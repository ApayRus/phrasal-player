import RegionsPlugin, {
	RegionParams,
	RegionsPluginParams
} from 'wavesurfer.js/src/plugin/regions'
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline'
import WaveSurfer from 'wavesurfer.js'
import { RefObject } from 'react'
import { PlayerContextState, Phrase } from '.'
import { findCurrentPhraseNum } from 'frazy-parser'
import { WaveSurferParams } from 'wavesurfer.js/types/params'

interface InitProps {
	waveformContainerRef: RefObject<HTMLDivElement>
	wavesurferTimelineRef: RefObject<HTMLDivElement>
	mediaElementRef: RefObject<HTMLMediaElement>
	regionsOptions?: RegionsPluginParams
	wavesurferOptions?: WaveSurferParams
	phrases?: Phrase[]
	setPlayerState: React.Dispatch<React.SetStateAction<PlayerContextState>>
}

export const initWavesurfer = ({
	waveformContainerRef,
	wavesurferTimelineRef,
	mediaElementRef,
	phrases,
	regionsOptions,
	wavesurferOptions,
	setPlayerState
}: InitProps) => {
	console.log('init')
	const wavesurfer = WaveSurfer.create({
		container: waveformContainerRef.current!,
		...wavesurferOptions,
		plugins: [
			RegionsPlugin.create({
				// regionsMinLength: 2,
				regions: phrases,
				...regionsOptions
			}),
			TimelinePlugin.create({
				container: wavesurferTimelineRef.current!
			})
		]
	})
	wavesurfer.load(mediaElementRef.current!)

	// UTILS

	const updatePhrase = (region: RegionParams) => {
		const {
			id,
			start,
			end,
			// @ts-ignore
			data: { text }
		} = region

		const phrase = { id, start, end, text } as Phrase

		setPlayerState(oldState => {
			const oldPhrases = oldState.phrases
			const phrases = updatePhrases(phrase, oldPhrases)
			return { ...oldState, phrases }
		})
	}

	const updateCurrentPhraseNum = (delta = 0) => {
		const currentTime: number = wavesurfer.getCurrentTime() + delta

		setPlayerState(oldState => {
			const phrases = oldState.phrases
			const currentPhraseNum = findCurrentPhraseNum(phrases, currentTime)
			return { ...oldState, currentPhraseNum }
		})
	}

	//EVENT HANDLERS
	wavesurfer.on('ready', () => {
		setPlayerState(oldState => ({ ...oldState, isReady: true }))
	})

	wavesurfer.on('audioprocess', () => {
		const currentTime = wavesurfer.getCurrentTime()
		setPlayerState(oldState => ({ ...oldState, currentTime }))
	})

	wavesurfer.on('region-click', (region, event) => {
		event.stopPropagation()
		region.play()
	})
	wavesurfer.on('region-removed', (region, event) => {
		setPlayerState(oldState => {
			const oldPhrases = oldState.phrases
			const phrases = oldPhrases.filter(elem => elem.id !== region.id)
			return { ...oldState, phrases }
		})
	})

	wavesurfer.on('region-updated', (region: Phrase, event) => {
		updatePhrase(region)
	})

	wavesurfer.on('region-in', (/* region: Phrase */) => {
		updateCurrentPhraseNum()
	})

	wavesurfer.on('region-out', (/* region: Phrase */) => {
		updateCurrentPhraseNum()
	})

	wavesurfer.on('seek', (/* region: Phrase */) => {
		updateCurrentPhraseNum()
	})

	wavesurfer.on('play', (/* region: Phrase */) => {
		setPlayerState(oldState => ({ ...oldState, isPlaying: true }))
	})

	wavesurfer.on('pause', (/* region: Phrase */) => {
		setPlayerState(oldState => ({ ...oldState, isPlaying: false }))
	})

	wavesurfer.on('finish', (/* region: Phrase */) => {
		setPlayerState(oldState => ({ ...oldState, isPlaying: false }))
	})

	return wavesurfer
}

function updatePhrases(phrase: Phrase, phrases: Phrase[]) {
	const phrasesExcept1 = phrases.filter(elem => elem.id !== phrase.id)
	const newPhrases = [...phrasesExcept1, phrase].sort(
		(a, b) => a.start - b.start
	)
	return newPhrases
}
