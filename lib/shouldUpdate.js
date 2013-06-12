/**
 * @param {Object} docViews the views for the design document currently in the database
 * @param{Object} codeViews the views for the new design document which may have changes not the database
 */
module.exports = function compareDef(docViews, codeViews) {
  // if neither the database _design document nor the candidate _design document have any views return false
  if (!docViews && !codeViews) {
    return false
  }

  if (!docViews && codeViews) {
    return true
  }
  var codeViewKeys = Object.keys(codeViews)
  var doesCodeHaveNewViews = codeViewKeys.some(function (key, index) {
    var codeView = codeViews[key]
		var docView = docViews[key]
    var codeViewMap = codeView.map
		var docViewMap = docView ? docView.map:undefined;
		if (codeViewMap || docViewMap) {
			var codeViewMapString = codeViewMap ? codeViewMap.toString().replace(/\s/g, '') : '';
			// see if the doc in the database also has this same view
			if (!docView) {
				return true
			}
			// check the map function
			var docViewMapString = docViewMap ? docViewMap.replace(/\s/g, '') : '';
			if (codeViewMapString !== docViewMapString) {
				return true
			}
		}
    // check the reduce function
    var codeViewReduce = codeView.reduce
    var docViewReduce = docView ? docView.reduce: undefined;

		if (codeViewReduce || docViewReduce) {
			if (!codeView.reduce && !docViewReduce) {
				return false
			}

			if (codeView.reduce && !docViewReduce) {
				return true
			}
			if (!codeView.reduce && docViewReduce) {
				return true
			}
			var docViewReduceString = docViewReduce.replace(/\s/g, '')
			var codeViewReduceString = codeViewReduce.toString().replace(/\s/g, '')
			if (codeViewReduceString !== docViewReduceString) {
				return true
			}
		}
		// check the index function
		var codeViewIndex = codeView.index
		var docViewIndex = docView ? docView.index : undefined

		if (codeViewIndex || docViewIndex) {
			if (!codeViewIndex && !docViewIndex) {
				return false
			}

			if (codeViewIndex && !docViewIndex) {
				return true
			}
			if (!codeViewIndex && docViewIndex) {
				return true
			}
			var docViewIndexString = docViewIndex.replace(/\s/g, '')
			var codeViewIndexString = codeViewIndex.toString().replace(/\s/g, '')
			if (codeViewIndexString !== docViewIndexString) {
				return true
			}
		}
    return false
  })
  if (doesCodeHaveNewViews) {
    return true
  }

  var docViewKeys = Object.keys(docViews)
  var doesDocHaveDifferentViews = docViewKeys.some(function (key, index) {
    var docView = docViews[key];
    // doc views are already strings here
    var docViewString = docView.map ? docView.map.replace(/\s/g,'') : '';
    // see if the code also has this same view
    var codeView = codeViews[key];
    if (!codeView) {
      return true
    }

    // codeView map value is an actual javascript function.
    // the doc in the database map value is stored as a string
    // Call toString on the code map function to compare it to the doc map function
    var codeViewString = codeView.map ? codeView.map.toString().replace(/\s/g,''): '';
    if (codeViewString !== docViewString) {
      return true
    }

    // check the reduce function
    var codeViewReduce = codeView.reduce
    var docViewReduce = docView.reduce

    if (!codeView.reduce && !docViewReduce) {
      return false
    }

    if (codeView.reduce && !docViewReduce) {
      return true
    }
    if (!codeView.reduce && docViewReduce) {
      return true
    }
    var docViewReduceString = docViewReduce.replace(/\s/g,'')
    var codeViewReduceString = codeViewReduce.toString().replace(/\s/g,'')
    if (codeViewReduceString !== docViewReduceString) {
      return true
    }
    return false

    return false
  })
  return doesDocHaveDifferentViews
}
