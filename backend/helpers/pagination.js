'use strict'

/**
 * import required files and define static constants
 * 
 * @author Raj Kanani
**/
const config 							= require('../config');

// import helpers
const utility                        = require('./../controllers/utility/general');


exports.getOffsetLimit = (page, limit) => {
	page = (utility.isNumeric(page)) ? parseInt(page) : config.pagination.defaultPage;
	limit = (utility.isNumeric(limit)) ? parseInt(limit) : config.pagination.defaultLimit;

	if(limit > config.pagination.maxpageLimit) limit = config.pagination.maxpageLimit;
	if(limit <= 0) limit = config.pagination.defaultLimit
	if(page <= 0) page = config.pagination.defaultPage
	
	let offset 	= (limit * page) - limit;
	return {offset, limit};
}

exports.getPaginationOptions = (req) => {
	const page = (req.query.page !== undefined) ? parseInt(req.query.page) : config.pagination.defaultPage;
	const limit = (req.query.pageSize !== undefined) ? parseInt(req.query.pageSize) : config.pagination.defaultLimit;

	return {
		page: page,
		limit: limit
	};
};

exports.searchPaginationObject = (order = 'asc', column = 'id', page = config.pagination.defaultPage, perPage = config.pagination.defaultLimit, searchText = "") => {
	const orderType = ['asc', 'desc'];
	column = column.toLowerCase()
	order = orderType.includes(order.toLowerCase()) ? order.toLowerCase() : 'asc';
	return {order, column, page, perPage, searchText}
}

exports.setPaginationHeaders = (res, result) => {
	res.set('Pagination-Count', result.total);
	res.set('Pagination-Page', result.page);
	res.set('Pagination-Limit', result.limit);
};
