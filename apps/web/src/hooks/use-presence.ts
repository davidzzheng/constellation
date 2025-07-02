import type { Id } from "convex/_generated/dataModel"
import { useMutation, useQuery } from "convex/react"
import debounce from "lodash.debounce"
import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "~/api"

const PRESENCE_UPDATE_INTERVAL = 100
const HEARTBEAT_INTERVAL = 30000

export function usePresence(taskId: Id<"tasks">, isShared: boolean) {
  const updatePresence = useMutation(api.presence.updatePresence)
  const removePresence = useMutation(api.presence.removePresence)
  const activeUsers = useQuery(api.presence.getActiveUsers, { taskId })
  const cursorPositionRef = useRef({ x: 0, y: 0 })
  const [localCursorPosition, setLocalCursorPosition] = useState({
    x: 0,
    y: 0,
  })

  const debouncedUpdatePresence = useCallback(
    debounce(
      (position: { x: number; y: number }) => {
        if (isShared) {
          updatePresence({
            taskId,
            cursorPosition: position,
            isHeartbeat: false,
          })
        }
      },
      PRESENCE_UPDATE_INTERVAL,
      { maxWait: PRESENCE_UPDATE_INTERVAL * 2 },
    ),
    [],
  )

  const updateCursorPosition = useCallback(
    (position: { x: number; y: number }) => {
      cursorPositionRef.current = position
      setLocalCursorPosition(position)
      if (isShared) {
        debouncedUpdatePresence(position)
      }
    },
    [debouncedUpdatePresence, isShared],
  )

  useEffect(() => {
    if (!isShared) return

    const heartbeatInterval = setInterval(() => {
      updatePresence({
        taskId,
        cursorPosition: cursorPositionRef.current,
        isHeartbeat: true,
      })
    }, HEARTBEAT_INTERVAL)

    return () => {
      clearInterval(heartbeatInterval)
      removePresence({ taskId })
    }
  }, [taskId, updatePresence, removePresence, isShared])

  return {
    activeUsers: isShared ? activeUsers : [],
    updateCursorPosition,
    localCursorPosition,
  }
}
