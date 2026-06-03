/**
 * INI file read/write utilities
 * JSON <-> INI conversion
 */

/**
 * Parse INI string to JavaScript object
 * @param {string} iniString - INI format string
 * @returns {object} - Parsed object
 */
export function parseINI(iniString) {
  const result = {}
  let currentSection = null

  const lines = iniString.split(/\r?\n/)
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) {
      continue
    }
    
    // Section header [SectionName]
    const sectionMatch = trimmed.match(/^\[(.+)\]$/)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      result[currentSection] = {}
      continue
    }
    
    // Key-value pair: key = value ; comment
    const kvMatch = trimmed.match(/^([^=]+)=(.*)$/)
    if (kvMatch && currentSection) {
      const key = kvMatch[1].trim()
      // Remove inline comments (after ;)
      let value = kvMatch[2].split(';')[0].trim()
      
      // Try to parse as number
      if (/^-?\d+$/.test(value)) {
        value = parseInt(value, 10)
      } else if (/^-?\d+\.\d+$/.test(value)) {
        value = parseFloat(value)
      } else if (value.toLowerCase() === 'true') {
        value = true
      } else if (value.toLowerCase() === 'false') {
        value = false
      }
      
      result[currentSection][key] = value
    }
  }
  
  return result
}

/**
 * Convert JavaScript object to INI string
 * @param {object} obj - JavaScript object
 * @returns {string} - INI format string
 */
export function stringifyINI(obj) {
  const lines = []
  
  for (const section of Object.keys(obj)) {
    lines.push(`[${section}]`)
    
    const sectionData = obj[section]
    if (typeof sectionData === 'object' && sectionData !== null) {
      for (const key of Object.keys(sectionData)) {
        const value = sectionData[key]
        lines.push(`${key}=${value}`)
      }
    }
    
    lines.push('') // Empty line between sections
  }
  
  return lines.join('\n')
}

/**
 * Read INI file and return as object
 * Uses Electron IPC to read file from AppData
 * @param {string} filename - INI filename (relative to AppData/Roaming/nextcap)
 * @returns {Promise<object>} - Parsed INI object
 */
export async function readINIFile(filename = 'config.ini') {
  try {
    // Check if electronAPI is available
    if (typeof window === 'undefined' || !window.electronAPI) {
      console.warn('⚠️ Electron API not available - running in browser mode')
      return { success: false, error: 'Electron API not available (browser mode)' }
    }
    
    if (!window.electronAPI.readINIFile) {
      console.warn('⚠️ readINIFile method not available on electronAPI')
      return { success: false, error: 'readINIFile method not available' }
    }
    
    const result = await window.electronAPI.readINIFile(filename)
    if (result.success) {
      return { success: true, data: parseINI(result.content) }
    }
    return { success: false, error: result.error }
  } catch (error) {
    console.error('Error reading INI file:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Read JSON config file and return as object
 * Uses the same Electron IPC channel as readINIFile but parses JSON instead
 * The returned data structure is identical to readINIFile so existing code is unaffected
 * @param {string} filename - JSON filename (relative to project root)
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function readJSONConfigFile(filename = 'config.json') {
  try {
    if (typeof window === 'undefined' || !window.electronAPI) {
      console.warn('⚠️ Electron API not available - running in browser mode')
      return { success: false, error: 'Electron API not available (browser mode)' }
    }

    if (!window.electronAPI.readINIFile) {
      console.warn('⚠️ readINIFile method not available on electronAPI')
      return { success: false, error: 'readINIFile method not available' }
    }

    const result = await window.electronAPI.readINIFile(filename)
    if (result.success) {
      const data = JSON.parse(result.content)
      return { success: true, data }
    }
    return { success: false, error: result.error }
  } catch (error) {
    console.error('Error reading JSON config file:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Write object to INI file
 * Uses Electron IPC to save file to AppData
 * @param {string} filename - INI filename (relative to AppData/Roaming/nextcap)
 * @param {object} data - JavaScript object to save
 * @returns {Promise<object>} - Result
 */
export async function writeINIFile(filename = 'config.ini', data) {
  try {
    if (window.electronAPI?.writeINIFile) {
      const iniString = stringifyINI(data)
      const result = await window.electronAPI.writeINIFile(filename, iniString)
      return result
    }
    return { success: false, error: 'Electron API not available' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export default {
  parseINI,
  stringifyINI,
  readINIFile,
  writeINIFile,
  readJSONConfigFile,
}
